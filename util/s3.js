import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export const uploadFileToS3 = async (file) => {
  const params = {
    Bucket: bucketName,
    Key: file.originalname,
    Body: file.buffer,
    ACL: "public-read",
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    const response = await s3.send(command);
    console.log("File uploaded successfully:", response);

    const commandToSign = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.originalname,
    });
    const s3ObjectUrl = await getSignedUrl(s3, commandToSign, {
      expiresIn: 604800,
    });

    console.log("File URL:", s3ObjectUrl);

    return s3ObjectUrl;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};
