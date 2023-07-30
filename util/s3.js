import multer from 'multer';
import multerS3, { AUTO_CONTENT_TYPE } from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

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

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    contentType: AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

export const s3Upload = upload.fields([{ name: 'file', maxCount: 1 }]);

export { s3 };

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
