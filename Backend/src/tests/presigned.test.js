import "dotenv/config";

import { createUploadURL } from "../services/s3.service.js";

try {
  const url = await createUploadURL({
    key: "test/presigned-test.txt",
    contentType: "text/plain",
  });

  console.log("✅ Presigned URL generated");
  console.log(url);
} catch (error) {
  console.error("❌ Failed to generate presigned URL");
  console.error(error);
}
