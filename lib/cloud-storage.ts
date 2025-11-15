"use server";

import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.PROJECT_ID!,
  credentials: {
    client_email: process.env.CLIENT_EMAIL!,
    private_key: process.env.PRIVATE_KEY!.replace(/\\n/g, "\n"),
  },
});

interface SignedUrlOptions {
  filename: string;
  contentType: string;
}
export async function getSignedUploadUrl({ filename, contentType }: SignedUrlOptions) {
  const bucket = storage.bucket(process.env.BUCKET_NAME!);
  const file = bucket.file(`products/${Date.now()}-${filename}`);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000, // valid 5 min
    contentType,
  });

  return { url, path: file.name }; // return signed URL + final file path
}

export async function getSignedViewUrl(url: string) {
  try {
    const bucket = storage.bucket(process.env.BUCKET_NAME!);

    const file = bucket.file(url);

    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // valid for 7 days
    });

    return signedUrl;
  } catch (error) {
    return url;
  }
}
