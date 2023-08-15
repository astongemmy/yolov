import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { notFound, serverError, success } from './api-responses';
import { Storage } from '@google-cloud/storage';
import { format } from 'util';

const cloudSecretName = 'projects/404962698555/secrets/mpdiag-key/versions/1';
const client = new SecretManagerServiceClient();

export const uploadFile = (file, bucket) => new Promise((resolve, reject) => {
  const { filename, buffer } = file;

	const blob = bucket.file(filename);
  const blobStream = blob.createWriteStream({
    resumable: false
  });

  blobStream.on('finish', () => {
    const url = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    resolve({ filename, url });
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
		const bucket = cloudStorage.bucket('mpdiag_bucket_v2');

		await Promise.all(files.map(async (file) => {
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			const filename = file.name;

			const fileData = {
				filename,
				buffer
			};

			try {
				const response = await uploadFile(fileData, bucket);
				data.push(response);
			} catch (error) {
				return serverError('An error occurred while uploading file(s)');
			}
		}));
	} catch (error) {
		console.log(error)
		return serverError('Server error', error);
	}

	return success('Files uploaded successfully', data);
}