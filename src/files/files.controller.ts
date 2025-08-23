import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { FilesService } from 'src/files/files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  async downloadFile(
    @Param('id') fileId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { name, mimeType, stream } =
      await this.filesService.downloadFile(fileId);

    res.setHeader('Content-Disposition', `inline; filename="${name}"`);
    res.setHeader('Content-Type', mimeType);

    stream.pipe(res);
  }
}
