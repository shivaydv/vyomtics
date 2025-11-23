"use client";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";

/**
 * Fetch authentication parameters from the server
 */
async function getAuthParams() {
  const response = await fetch("/api/imagekit-auth");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Auth request failed: ${errorText}`);
  }
  const data = await response.json();
  return data;
}

/**
 * Upload multiple files to ImageKit
 * @param files - Array of File objects to upload
 * @returns Object with successful and failed uploads
 */
export async function uploadFilesToCloud({ files }: { files: File[] }) {
  // Step 1: Get authentication parameters once for all uploads
  let authParams;
  try {
    authParams = await getAuthParams();
  } catch (error: any) {
    // If auth fails, all uploads fail
    return {
      success: [],
      failed: files.map((file) => ({
        file,
        error: `Authentication failed: ${error.message}`,
      })),
    };
  }

  const { signature, expire, token, publicKey } = authParams;

  // Step 2: Upload all files in parallel
  const uploadResults = await Promise.allSettled(
    files.map(async (file) => {
      try {
        const uploadResponse = await upload({
          file,
          fileName: file.name,
          signature,
          expire,
          token,
          publicKey,
          folder: "/products", // Upload to products folder
          useUniqueFileName: true, // Auto-generate unique names
        });

        return {
          file,
          path: uploadResponse.url!, // Full ImageKit URL - store this in DB
          url: uploadResponse.url!, // Full ImageKit URL
        };
      } catch (error: any) {
        // Handle different error types
        let errorMessage = "Upload failed";

        if (error instanceof ImageKitAbortError) {
          errorMessage = "Upload aborted";
        } else if (error instanceof ImageKitInvalidRequestError) {
          errorMessage = `Invalid request: ${error.message}`;
        } else if (error instanceof ImageKitUploadNetworkError) {
          errorMessage = `Network error: ${error.message}`;
        } else if (error instanceof ImageKitServerError) {
          errorMessage = `Server error: ${error.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    })
  );

  // Step 3: Collect success & failure
  const success: { file: File; path: string; url: string }[] = [];
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
