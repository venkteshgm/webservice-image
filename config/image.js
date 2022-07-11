const users = require('./user');
const authTools = require('./auth_tools');
const { v4: uuidv4 } = require("uuid");
const helper = require('./helper');
const s3 = require("./s3.config");

let metrics = require('../cloudwatch-metrics');
const log = require("../logs")
const logger = log.getLogger('logs');


let images = {}
images.addOrUpdateImage = async function(req, res, dbCon){
    logger.info("[INFO]: Add/UpdateUserProfileImage endpoint hit");
    let userDetails = await users.returnUserIfExistsElseNone(req, res, dbCon.userTable);
    if(!userDetails){
        logger.info("[ERROR] 404: User details error");
        return;
    }
    let queriedImage = await this.getImageIfExistsElseNone(userDetails, dbCon);
    let verifiedName = this.verifyImageFileName(req.file.originalname);
    if(!verifiedName){
        res.status(415).json({'isValid':false, 'message':'invalid image'});
        return;
    } 
    if(!queriedImage){
        let imageDetails  = {
            id: uuidv4(),
            file_name: req.file.originalname,
            user_id: userDetails.id,
            url: `${process.env.BUCKET_NAME}/${userDetails.id}/${req.file.originalname}`,
            // password: req.body.password,
            // username: req.body.username,
        };
        queriedImage = await dbCon.imageTable.create(imageDetails);
        metrics.increment('UserImage.POST.Create_UserImage');
        logger.info("[INFO]: Profile image added");
    }
    else{
        await s3.s3Client.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: queriedImage.url
        }, function(err, data){
            if(err){
                throw err;
            }
            console.log(`File deleted successfully.${queriedImage.url}`);
        });
        logger.info("[INFO]: Profile image deleted");
        await dbCon.imageTable.update({
            file_name: req.file.originalname,
            url: `${process.env.BUCKET_NAME}/${userDetails.id}/${req.file.originalname}`
        },
        {
            where: { id: queriedImage.id}
        });
        queriedImage.file_name =  req.file.originalname;
        queriedImage.url = `${process.env.BUCKET_NAME}/${userDetails.id}/${req.file.originalname}`;
        metrics.increment('UserImage.POST.Create_UserImage');
        logger.info("[INFO]: Profile image added");
    }
    s3.s3Client.upload({
        Bucket: process.env.BUCKET_NAME,
        Key : `${process.env.BUCKET_NAME}/${userDetails.id}/${req.file.originalname}`,
        Body : req.file.buffer
    }, function(err, data){
        if(err){
            throw err;
        }
        console.log(`File uploaded successfully.${data.Location}`);
    });
    createdImage = helper.changeImageAttributes(queriedImage);
    console.log(queriedImage);
    res.status(200).json(createdImage);
    
};

images.getImageIfExistsElseNone = async function(user, dbCon){
    let queriedImage = await dbCon.imageTable.findOne({
        where: {
            'user_id' : user.id
        }
    });
    return queriedImage;
    
};

images.verifyImageFileName = function(fileName){
    if(!fileName.match(/\.(jpg|jpeg|png)$/i)){
        return false;
    }
    else{
        return true;
    }
};

images.getImage = async function(req, res, dbCon){
    logger.info("[INFO]: GetUserProfileImage endpoint hit");
    metrics.increment('UserImage.GET.Get_UserImage');
    let userDetails = await users.returnUserIfExistsElseNone(req, res, dbCon.userTable);
    if(!userDetails){
        return;
    }
    let queriedImage = await this.getImageIfExistsElseNone(userDetails, dbCon);
    if(!queriedImage){
        logger.info(`[ERROR] 404: User profile image not found`);
        res.status(400).json({'isValid':false, 'message':'user does not have an image'});
        return;
    }
    else{
        createdImage = helper.changeImageAttributes(queriedImage);
        res.status(200).json(createdImage);
        return;
    }
    // res.sendStatus(200);
};

images.deleteImage = async function(req, res, dbCon){
    logger.info("[INFO]: RemoveProfileImage endpoint hit");
    metrics.increment('UserImage.DELETE.Delete_UserImage');
    let userDetails = await users.returnUserIfExistsElseNone(req, res, dbCon.userTable);
    if(!userDetails){
        return;
    }
    let queriedImage = await this.getImageIfExistsElseNone(userDetails, dbCon);
    if(!queriedImage){
        res.status(400).json({'isValid':false, 'message':'user does not have an image'});
        logger.info(`[ERROR] 404: User profile image not found`);
        return;
    }
    await dbCon.imageTable.destroy({
        where:{
            id: queriedImage.id
        }
    });
    await s3.s3Client.deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: queriedImage.url
    }, function(err, data){
        if(err){
            throw err;
        }
        console.log(`File deleted successfully.${queriedImage.url}`);
        logger.info(`[INFO]: User profile image removed`);
    });
    res.status(200).json({'isValid':true, 'message':'user image deleted'});
}

module.exports = images;