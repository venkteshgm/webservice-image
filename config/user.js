// const userTable = require("./db").userTable;
const { v4: uuidv4 } = require("uuid");
const emailValidator = require("email-validator");
const helper = require("./helper");
const authTools = require('./auth_tools');
const queries = require('./queries');
const userFunctions = require('./userFunctions');
const { userTable } = require("./db");
let metrics = require('../cloudwatch-metrics');
const log = require("../logs")
const logger = log.getLogger('logs');
const crypto = require('crypto');
const dynamo = require('../config/dynamodb.config');
const sns = require('../config/sns.config');


//USER API FUNCTIONS
let users = {};

/* create user using body parameters */
users.createUser = async function (req, res, userTable) {
  logger.info("[INFO]: CreateUser endpoint hit");
  metrics.increment('User.POST.Create_User');
  let userDetails = {
    id: uuidv4(),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    password: req.body.password,
    username: req.body.username,
  };
  let validity = await validateUserDetails(userDetails);
  if (!validity.isValid) {
      logger.info("[ERROR] 400: Error in User create input info");
      res.status(400).json(validity.message);
      return;
  }
  else{
        userDetails.password = await authTools.passwordGenerator(userDetails.password);
        let createdUser = await userTable.create(userDetails);
        logger.info(`[INFO]: New user created: ${createdUser.username}`)
        const token = crypto.randomBytes(16).toString("hex");
        const putParams = {
          TableName: process.env.DYNAMODBTABLENAME,
          Item: {
              'username': {S: createdUser.username},
              'token': {S: token},
              'ttl': {N: (Math.floor(+new Date() / 1000) + 120).toString()}
          }
        };
        dynamo.dynamoDBClient.putItem(putParams, (err, putItemResponse) => {
          if (err) {
              console.log("error message:",err);
              logger.info(`[ERROR]: ${err.message}`)
              res.status(504).json({
                  message : err.message
              });
              return;
          } else {
              logger.info(`[INFO]: New user token uploaded to DynamoDB : ${token}`)
              //Publish in Amazon SNS
              const message = {
                  Message: `Email Verification Request`, /* required */
                  TopicArn: process.env.SNSTOPICARN,
                  MessageAttributes: {
                      'username': {
                          DataType: 'String',
                          StringValue: createdUser.username
                      },
                      'token': {
                          DataType: 'String',
                          StringValue: token
                      }
              }};
              sns.publishTextPromise.publish(message).promise().then(
                  function (data) {
                      logger.info(`[INFO]: Message ${message.Message} sent to the topic ${message.TopicArn}`);
                      logger.info("[INFO]: MessageID is " + data.MessageId);
                      res.status(201)
                          .json({
                              "id": createdUser.id,
                              "first_name": createdUser.first_name,
                              "last_name": createdUser.last_name,
                              "username": createdUser.username,
                              // "account_created": createdUser.createdAt,
                              // "account_updated": createdUser.updatedAt
                          });
                          return;
                  }).catch(
                  function (err) {
                      logger.info(`[ERROR]: ${err.message}`)
                      console.log("sns error")
                      res.status(504).send();
                      return;
                  });
          }
        });
        createdUser = helper.changeUserDataUpdateAttributes(createdUser);
        return;
  }
};

users.resendVerificationEmail = async function(req, res, userTable){
  logger.info("[INFO]: resend Verification mail endpoint hit");
  let userDetails = await this.returnUserIfExistsElseNone(req, res, userTable);
  if (!userDetails) {
      return;
  }
  else{
        const token = crypto.randomBytes(16).toString("hex");
        const deleteParams = {
          TableName: process.env.SESDDBTABLENAME,
          Key: {
            'emailid': {S: userDetails.username},
          }
          
        };
        await dynamo.dynamoDBClient.deleteItem(deleteParams, (err, deleteItemResponse) => {
          if(err){
            console.log("error message:",err);
            logger.info(`[ERROR]: ${err.message}`);
            res.status(504).json({ message : err.message});
            return;
          } else{
            logger.info(`[INFO]: Username entry removed in SESDDBTable for resending verification email : ${token}`);
          }
        });
        const updateParams = {
          TableName: process.env.DYNAMODBTABLENAME,
          ExpressionAttributeNames: {
            "#AT" : "token",
            "#Y": "ttl"
          },
          ExpressionAttributeValues: {
            ":t":{S: token},
            ":y": {N: (Math.floor(+new Date() / 1000) + 120).toString()}
          },
          Key: {
              'username': {S: userDetails.username},
          },
          UpdateExpression: "SET #Y = :y, #AT = :t"
        };
        await dynamo.dynamoDBClient.updateItem(updateParams, (err, putItemResponse) => {
          if (err) {
              console.log("error message:",err);
              logger.info(`[ERROR]: ${err.message}`)
              res.status(504).json({
                  message : err.message
              });
              return;
          } else {
              logger.info(`[INFO]: New user token uploaded to DynamoDB : ${token}`);
              //Message to publish in Amazon SNS
              const message = {
                  Message: `Email Verification Request`, /* required */
                  TopicArn: process.env.SNSTOPICARN,
                  MessageAttributes: {
                      'username': {
                          DataType: 'String',
                          StringValue: userDetails.username
                      },
                      'token': {
                          DataType: 'String',
                          StringValue: token
                      }
              }};
              sns.publishTextPromise.publish(message).promise().then(
                  function (data) {
                      logger.info(`[INFO]: Message ${message.Message} sent to the topic ${message.TopicArn}`);
                      logger.info("[INFO]: MessageID is " + data.MessageId);
                      res.status(201)
                          .json({
                              result: "success",
                              message: "email has been resent to the registered email. Make sure to check in junk/spam folder if not found in inbox"
                          });
                          return;
                  }).catch(
                  function (err) {
                      logger.info(`[ERROR]: ${err.message}`)
                      console.log("sns error");
                      res.status(504).send();
                      return;
                  });
          }
        });
        return;
  }
};

/* get user data using auth details */
users.getUser = async function(req, res, userTable){
    logger.info("[INFO]: GetUserById endpoint hit");
    let userDetails = await this.returnUserIfExistsElseNone(req, res, userTable);
    if(userDetails && emailVerified(userDetails)){
      metrics.increment('User.GET.Get_User_By_Id');
      userDetails = helper.changeUserDataUpdateAttributes(userDetails);
      res.status(200).json(helper.changeUserDataUpdateAttributes(userDetails));
      return;
    } else{
      res.status(400).json({'isValid':false, 'message':'user is unverified'});
        return;
    }
}

function emailVerified(userDetails){
  if(userDetails && userDetails.status == "Verified"){
    return true;
  }
  else{
    return false;
  }
}
users.returnUserIfExistsElseNone = async function(req, res, userTable){
  let userDetails = await authTools.tokenAuth(req, userTable);
    if(userDetails == false){
        logger.info("[ERROR] 401: User does not exists");
        res.status(400).json({'isValid':false, 'message':'invalid credentials'});
        return;
    }
    else{
      logger.info(`[INFO]: User authenticated: ${userDetails.username}`);
      return userDetails;
    }
}
/* update user data according to params in body */
users.updateUser = async function(req, res, userTable){
  logger.info("[INFO]: UpdateUser endpoint hit");
  let userDetails = await this.returnUserIfExistsElseNone(req, res, userTable);
  if(!userDetails){
    return;
  }
  if(!emailVerified(userDetails)){
    return;
  }
  await userFunctions.updateUser(req, userDetails, userTable);
  console.log('user updated');
  metrics.increment('User.PUT.Update_User');
  userDetails = await queries.getUserFromUsername(userDetails.username, userTable);
  logger.info(`[INFO]: User updated`);
  res.status(200).json(helper.changeUserDataUpdateAttributes(userDetails));
  return;
    // }
}

/* checking for validity of data passed for user creation */
async function validateUserDetails(userDetails) {
    validity = { isValid: true, message: "-" };
    if (userDetails.first_name == "" || userDetails.first_name == undefined) {
      validity.isValid = false;
      validity.message += "invalid first_name,";
    }
    if (userDetails.last_name == "" || userDetails.last_name == undefined) {
      validity.isValid = false;
      validity.message += "invalid last_name,";
    }
    if (!emailValidator.validate(userDetails.username) || userDetails.username == "" || userDetails.username == undefined) {
        console.log("flagged as wrong");
      validity.isValid = false;
      validity.message += "invalid username,";
    }
    else if(await getUserFromUsername(userDetails.username)){
        validity.isValid = false;
        validity.message += "username already exists,";
    }
    if (userDetails.password == "" || userDetails.password == undefined) {
      validity.isValid = false;
      validity.message += "invalid password,";
    }
    
    return validity;
  }

/* get user data from username(email) */
async function getUserFromUsername(username){
    return queries.getUserFromUsername(username, userTable);

}

users.verifyUser = async function(req, res, userTable){
  console.log('user verification endpoint hit');
  logger.info("[INFO]: VerifyUser endpoint hit")
  userTable.findOne({
      where: {username: req.query.email}
  }).then(async (response) => {
      if (response == null) {
          //User not present
          logger.info("[ERROR] 400: User not found")
          res.status(400).send();
          return;
      } else {
          metrics.increment('User.PUT.User_Verification')
          //Get token from DynamoDB
          const getParams = {
              TableName: process.env.DYNAMODBTABLENAME,
              Key: {
                  "username": {S: response.dataValues.username}
              }
          }
          await dynamo.dynamoDBClient.getItem(getParams, (err, getResponseItem) => {
              if (err) {
                  logger.info(`[ERROR]: ${err.message}`);
                  res.status(504).send();
                  return;
              } else {
                  logger.info(`[INFO]: User verification token retrieved from DynamoDB`);
                  if (getResponseItem.Item.token.S === req.query.token && Math.floor(Date.now()/1000) < getResponseItem.Item.ttl.N) {
                      delete response.dataValues.password;
                      const updatedUser = {
                          ...response.dataValues,
                          status : "Verified"
                      }
                      console.log(updatedUser);
                      response.update(updatedUser).then(updatedUser => {
                          logger.info(`[INFO]: User email id verified`)
                          res.status(201).json({
                            success:true,
                            message: "User has been verified"
                          });
                          return;
                      });
                  } else {
                      logger.info(`[ERROR]: Token mismatch`)
                      res.status(400).json({
                          success: false,
                          message: "DDB Token and Params Token mismatch"
                      });
                      return;
                  }
              }
          })
      }
  });
}


module.exports = users;
