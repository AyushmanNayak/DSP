require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    endpoint: `https://s3.${process.env.S3_REGION}.amazonaws.com`,
});

const s3_bucket = process.env.S3_BUCKET;

module.exports = { s3, s3_bucket };