const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  region: process.env.awsRegionUS,
  endpoint: process.env.awsEndpointUS,
  credentials: {
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey
  }
});

module.exports = new AWS.DynamoDB.DocumentClient();
