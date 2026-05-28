import {
  Controller,
  Post,
  Get,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VideosService } from './videos.service';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter(_req, file, cb) {
        if (!file.mimetype.startsWith('video/')) {
          return cb(new BadRequestException(`${file.originalname} is not a video`), false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('No video files provided');
    }
    return this.videosService.upload(files);
  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }
}
