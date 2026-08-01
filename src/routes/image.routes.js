import express from "express";
import { getImageStream } from "../services/storage.service.js";

export const imageRouter = express.Router();

// The asterisk catches the full path after /images/ (e.g. news/123.png)
// imageRouter.get('/*', async (req, res, next) => {
//   try {
//     // req.params[0] holds the wildcard match
//     const key = req.params[0];

//     if (!key) {
//       return res.status(400).json({ error: 'Image key is required' });
//     }

//     const { stream, contentType } = await getImageStream(key);

//     res.setHeader('Content-Type', contentType);
//     // Cache the proxy image for 1 hour locally
//     res.setHeader('Cache-Control', 'public, max-age=3600');

//     stream.pipe(res);
//   } catch (error) {
//     // If S3 throws a NoSuchKey or we fail to fetch, return 404
//     res.status(404).json({ error: 'Image not found' });
//   }
// });

imageRouter.get("/*", async (req, res) => {
  try {
    const key = req.params[0];

    console.log("Requested key:", key);

    const { stream, contentType } = await getImageStream(key);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(404).json({
      error: err.name,
      message: err.message,
    });
  }
});

// import { ListObjectsV2Command } from "@aws-sdk/client-s3";
// import { s3Client, R2_BUCKET_NAME } from "../config/storage.js";

// imageRouter.get("/debug/list", async (req, res) => {
//   const command = new ListObjectsV2Command({
//     Bucket: R2_BUCKET_NAME,
//   });

//   const result = await s3Client.send(command);

//   res.json(result.Contents.map((x) => x.Key));
// });
