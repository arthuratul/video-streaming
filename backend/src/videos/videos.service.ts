import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideosService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly urlExpiry: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = this.config.getOrThrow<string>('AWS_REGION');
    this.urlExpiry = Number(this.config.get('S3_PRESIGNED_URL_EXPIRY') ?? 3600);

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(files: Express.Multer.File[]) {
    return Promise.all(files.map((f) => this.uploadOne(f)));
  }

  private async uploadOne(file: Express.Multer.File) {
    const key = `videos/${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException(`S3 upload failed: ${(err as Error).message}`);
    }

    const video = await this.prisma.video.create({
      data: {
        originalName: file.originalname,
        s3Key: key,
        size: file.size,
        mimeType: file.mimetype,
      },
    });

    return { ...video, url: await this.presign(key) };
  }

  async findAll() {
    const videos = await this.prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      videos.map(async (v) => ({ ...v, url: await this.presign(v.s3Key) })),
    );
  }

  private presign(key: string) {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: this.urlExpiry },
    );
  }
}
