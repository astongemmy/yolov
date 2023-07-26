import { notFound, serverError, success } from "./api-responses";
import { Storage } from "@google-cloud/storage";
import { format } from "util";

const cloudStorage = new Storage({
  keyFilename: `./env/mpdiag-73fc22fc433d.json`,
  projectId: "mpdiag",
});

export const uploadFile = (file) => new Promise((resolve, reject) => {
	const bucket = cloudStorage.bucket('mpdiag_bucket_v2');

  const { originalname, buffer } = file;

	const blob = bucket.file(originalname);
  const blobStream = blob.createWriteStream({
    resumable: false
  });

  blobStream.on('finish', () => {
    const url = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    resolve({ name: originalname, url });
  });

	blobStream.on('error', (error) => reject(error));
  blobStream.end(buffer);
})

export const POST = async (request) => {
	const data = [];

	try {
		const formData = await request.formData();
		const files = Array.from(formData.values());
		
		if (!files || !files.length) return notFound('No files to upload');
		
		await Promise.all(files.map(async (file) => {
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			const originalname = file.name;

			const fileData = {
				originalname,
				buffer
			};

			try {
				const response = await uploadFile(fileData);
				data.push(response);
			} catch (error) {
				return serverError('An error occurred while uploading file(s)');
			}
		}));
	} catch (error) {
		return serverError('Server error');
	}

	return success('Files uploaded successfully', data);
}