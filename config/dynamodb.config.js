const AWS = require("aws-sdk");

AWS.config.region = process.env.REGION;
AWS.config.credentials = new AWS.EC2MetadataCredentials({
    httpOptions: { timeout: 5000 },
    maxRetries: 10,
    retryDelayOptions: { base: 200 },
});

// const awsConfig = {
//     "region" : "us-east-1",
//     "accessKeyId" : process.env.AWS_ACCESS_KEY_ID,
//     "secretAccessKey" : process.env.AWS_SECRET_ACCESS_KEY
// }
// AWS.config.update(awsConfig);



const dynamoDBClient = new AWS.DynamoDB({
    credentials: AWS.config.credentials,
    region: AWS.config.region,
    // "accessKeyId" : process.env.AWS_ACCESS_KEY_ID,
    // "secretAccessKey" : process.env.AWS_SECRET_ACCESS_KEY
});

const dynamo = {};
dynamo.dynamoDBClient = dynamoDBClient;

module.exports = dynamo;
