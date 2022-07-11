const AWS = require("aws-sdk");

AWS.config.region = process.env.REGION;
AWS.config.credentials = new AWS.EC2MetadataCredentials({
  httpOptions: { timeout: 5000 },
  maxRetries: 10,
  retryDelayOptions: { base: 200 },
});

const s3Client = new AWS.S3({
  credentials: AWS.config.credentials,
  region: AWS.config.region,
  // "accessKeyId" : process.env.AWS_ACCESS_KEY_ID,
  // "secretAccessKey" : process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = {};

s3.s3Client = s3Client;

module.exports = s3;