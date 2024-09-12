import { Response } from 'express'
import { diskStorage } from 'multer';

import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter,
    // limits: { fileSize: 1000 },
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }))
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ) {

    if (!file) throw new BadRequestException('Make sure that the file as image');

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;

    return {
      secureUrl,
    };

  }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {

    const path = this.filesService.getStaticProductImage(imageName);

    return res.sendFile(path);

  }

}