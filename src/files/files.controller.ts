import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { FilesService } from 'src/files/files.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Download a file from Google Drive' })
  @ApiParam({
    name: 'id',
    description: 'Google Drive file ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
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
