import { google } from "googleapis";
import { Readable } from "stream";

export const uploadToDrive = async (
  file: Express.Multer.File,
  folderId: string,
) => {
  // ✅ create auth INSIDE the function so env vars are already loaded
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  console.log("📁 Uploading to Drive...");
  console.log("Folder ID:", folderId);
  console.log("Client Email:", process.env.GOOGLE_CLIENT_EMAIL);
  console.log("Private Key exists:", !!process.env.GOOGLE_PRIVATE_KEY);

  try {
    const stream = Readable.from(file.buffer);

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId],
      },
      media: {
        mimeType: file.mimetype,
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
    });

    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    console.log("✅ Upload success:", response.data);

    return {
      fileUrl: response.data.webViewLink,
      downloadUrl: response.data.webContentLink,
    };
  } catch (err) {
    console.error("❌ Drive error details:", JSON.stringify(err, null, 2));
    throw err;
  }
};
