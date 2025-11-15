"use client";
import { getSignedUploadUrl } from "./cloud-storage";

export async function uploadFilesToCloud({ files }: { files: File[] }) {
  // Step 1: request signed URLs for all files in parallel
  const signedUrls = await Promise.all(
    files.map(async (file) => {
      try {
        const { url, path } = await getSignedUploadUrl({
          filename: file.name,
          contentType: file.type,
        });
        return { file, url, path };
      } catch (err: any) {
        return { file, error: err.message };
      }
    })
  );

  // Step 2: upload files directly to signed URLs
  const uploadResults = await Promise.allSettled(
    signedUrls.map(async (item) => {
      if ("error" in item) {
        throw new Error(item.error); // skip if failed to get signed url
      }

      const { file, url, path } = item;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!res.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }

      return { file, path };
    })
  );

  // Step 3: collect success & failure
  const success: { file: File; path: string }[] = [];
  const failed: { file: File; error: string }[] = [];

  uploadResults.forEach((result, index) => {
    const originalFile = files[index];
    if (result.status === "fulfilled") {
      success.push(result.value);
    } else {
      failed.push({ file: originalFile, error: result.reason.message });
    }
  });

  return { success, failed };
}
