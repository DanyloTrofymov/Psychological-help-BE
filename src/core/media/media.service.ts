import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

@Injectable()
export class MediaService {
	private storage: Storage;
	private bucketName = 'psychohelpstorage';
	constructor(private readonly prisma: PrismaService) {
		this.storage = new Storage({
			projectId: process.env.PROJECT_ID,
			keyFilename: '.google-env.json'
		});
	}
	async create(file: Express.Multer.File) {
		const { originalname, buffer, mimetype } = file;
		const nameToWrite = this.renameFile(originalname);
		const blob = this.storage.bucket(this.bucketName).file(nameToWrite);
		try {
			await new Promise<void>((resolve, reject) => {
				const blobStream = blob.createWriteStream({
					resumable: false
				});

				blobStream.on('error', err => {
					reject(err);
				});

				blobStream.on('finish', () => {
					resolve();
				});

				blobStream.end(buffer);
			});

			const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${blob.name}`;
			const prismaResponse = await this.prisma.media.create({
				data: {
					type: mimetype,
					url: publicUrl
				}
			});

			return prismaResponse;
		} catch (err) {
			throw new Error(`Failed to upload file: ${err.message}`);
		}
	}

	findOne(id: number) {
		return `This action returns a #${id} media`;
	}

	remove(id: number) {
		return `This action removes a #${id} media`;
	}

	renameFile(filename: string) {
		const timestamp = new Date().getTime();
		const replacedSpaces = filename.replace(/\s/g, '_');
		const lastDotIndex = replacedSpaces.lastIndexOf('.');

		if (lastDotIndex > 0 && lastDotIndex < replacedSpaces.length - 1) {
			return `${replacedSpaces.substring(0, lastDotIndex)}_${timestamp}${replacedSpaces.substring(lastDotIndex)}`;
		} else {
			return `${replacedSpaces}_${timestamp}`;
		}
	}
}
