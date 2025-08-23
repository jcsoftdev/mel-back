import { Injectable } from '@nestjs/common';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Injectable()
export class FilesService {
  private readonly driveClient: GoogleDriveService;
  constructor(private readonly googleService: GoogleDriveService) {
    this.driveClient = googleService;
  }

  async downloadFile(fileId: string) {
    const response = await this.driveClient.getMediaStream(fileId);

    return {
      name: `archivo-${fileId}.pdf`,
      mimeType: response.headers?.['content-type'] as string,
      data: response.data,
      stream: response.data,
    };
  }
}
