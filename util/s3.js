import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

async function uploadFileToS3(file) {
  const params = {
    Bucket: bucketName,
    Key: file.originalname,
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    const response = await s3.send(command);
    console.log('File uploaded successfully:', response);

    const commandToSign = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.originalname,
    });
    const s3ObjectUrl = await getSignedUrl(s3, commandToSign, {
      expiresIn: 604800,
    });

    console.log('File URL:', s3ObjectUrl);

    return s3ObjectUrl;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
}

export { uploadFileToS3 };

// s3 req.file에 전달되는거
//  { fieldname: 'thumbnail',
// originalname: '0d88ec7f047ebf21e4ebe45d7b852afe.jpg',
// encoding: '7bit',
// mimetype: 'image/jpeg',
// size: 20596,
// bucket: '내가 지정한 bucket',
// key: 's3에 저장된 이름',
// acl: 'public-read-write',
// contentType: 'application/octet-stream',
// contentDisposition: null,
// storageClass: 'STANDARD',
// serverSideEncryption: null,
// metadata: null,
// location: '해당 이미지를 가지고 있는 url 주소',
// etag: '"etag"',
// versionId: undefined }
