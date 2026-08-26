import "dotenv/config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/aws.js";

const command = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: "test/hello.txt",
  Body: "Hello from PMS 🚀",
  ContentType: "text/plain",
});

try {
  const res = await s3Client.send(command);

  console.log("S3 connection successfull");
  console.log("Bucket:", process.env.AWS_S3_BUCKET);
  console.log("Key: test/hello.txt");
  //   console.log("Contents: ", res.Contents ?? []);
} catch (error) {
  console.error("❌ S3 connection failed");
  console.error(error);
}
