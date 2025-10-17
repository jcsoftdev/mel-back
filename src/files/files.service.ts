import { Injectable } from '@nestjs/common';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Injectable()
export class FilesService {
  private readonly driveClient: GoogleDriveService;
  constructor(private readonly googleService: GoogleDriveService) {
    this.driveClient = googleService;
  }

  async downloadFile(fileId: string) {
    // Obtener metadatos del archivo para el nombre y tipo MIME
    const fileMetadata = await this.driveClient.getFolderById(fileId);

    // Obtener el stream del archivo
    const response = await this.driveClient.getMediaStream(fileId);

    return {
      name: fileMetadata.name || `archivo-${fileId}`,
      mimeType: fileMetadata.mimeType || 'application/octet-stream',
      data: response.data,
      stream: response.data,
    };
  }
}
