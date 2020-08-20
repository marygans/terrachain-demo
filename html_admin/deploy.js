const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const s3 = new AWS.S3({
  accessKeyId: 'ACCESS',
  secretAccessKey: 'SECRET'
});


const BUCKET_NAME = 'terra-demo-artemis';
const PATH_TO_UPLOAD = './dist';



function uploadArtifactsToS3() {
  const walkSync = (currentDirPath, callback) => {
    fs.readdirSync(currentDirPath).forEach((name) => {
      const filePath = path.join(currentDirPath, name);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        callback(filePath, stat);
      } else if (stat.isDirectory()) {
        walkSync(filePath, callback);
      }
    });
  };

  walkSync(PATH_TO_UPLOAD, async (filePath) => {
    let bucketPath = filePath.substring(PATH_TO_UPLOAD.length - 1);
    let contentType = 'text/html';
    if (bucketPath.endsWith('js')) {
      contentType = 'text/js';
    } else if (bucketPath.endsWith('css')) {
      contentType = 'text/css';
    }

    let params = {
      Bucket: BUCKET_NAME,
      Key: bucketPath,
      Body: fs.readFileSync(filePath),
      ContentType: contentType
    };
    try {
      await s3.putObject(params).promise();
      console.log(`Successfully uploaded ${bucketPath} to s3 bucket`);
    } catch (error) {
      console.error(`error in uploading ${bucketPath} to s3 bucket`);
      throw new Error(`error in uploading ${bucketPath} to s3 bucket`);
    }
  });
}


uploadArtifactsToS3()
