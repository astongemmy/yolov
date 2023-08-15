import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { notFound, serverError, success } from './api-responses';
import { Storage } from '@google-cloud/storage';
import { format } from 'util';

const cloudSecretName = 'projects/404962698555/secrets/mpdiag-key/versions/1';
const client = new SecretManagerServiceClient();

export const uploadFile = (file, cloudStorage) => new Promise((resolve, reject) => {
	
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

		const [version] = await client.accessSecretVersion({ name: cloudSecretName });
		const credentials = JSON.parse(version.payload.data.toString());
		const cloudStorage = new Storage(credentials);

		await Promise.all(files.map(async (file) => {
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			const originalname = file.name;

			const fileData = {
				originalname,
				buffer
			};

			try {
				const response = await uploadFile(fileData, cloudStorage);
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