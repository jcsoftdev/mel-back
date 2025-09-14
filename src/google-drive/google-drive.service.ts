import { Injectable } from '@nestjs/common';
import { drive_v3, google } from 'googleapis';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { Readable } from 'node:stream';
import { ConfigService } from 'src/config/config.service';
import { GoogleDriveDirectoryDto } from 'src/google-drive/google-drive.dto';

@Injectable()
export class GoogleDriveService {
  private readonly driveClient: drive_v3.Drive;

  constructor(private readonly configService: ConfigService) {
    const auth = new google.auth.JWT(
      configService.googleDrive.clientId,
      undefined,
      configService.googleDrive.privateKey?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive'],
    );

    this.driveClient = google.drive({
      version: 'v3',
      auth: auth,
    });
  }

  async getMediaStream(fileId: string): Promise<GaxiosPromise<Readable>> {
    const response = await this.driveClient.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
    );
    return response;
  }

  async getFileAsBase64(fileId: string): Promise<string> {
    const response = await this.driveClient.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' },
    );
    const buffer = Buffer.from(response.data as ArrayBuffer);
    return buffer.toString('base64');
  }

  async getDirectoryTree(folderId: string) {
    const files = await this.getAllFilesRecursive(folderId);
    const tree = this.buildTree(files, folderId);
    return tree;
  }

  async getAllFolders(): Promise<drive_v3.Schema$File[]> {
    let folders: drive_v3.Schema$File[] = [];
    let nextPageToken: string | undefined;

    do {
      const res = await this.driveClient.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'nextPageToken, files(id, name)',
        pageSize: 1000, // Increase the number of folders retrieved per request
        pageToken: nextPageToken,
      });

      folders = folders.concat(res?.data?.files || []);
      nextPageToken = res.data?.nextPageToken ?? undefined;
    } while (nextPageToken);

    return folders;
  }

  async getFolderById(folderId: string): Promise<drive_v3.Schema$File> {
    const res = await this.driveClient.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType, parents',
    });

    return res.data;
  }

  async getAllFilesRecursive(
    folderId: string,
  ): Promise<drive_v3.Schema$File[]> {
    let files: drive_v3.Schema$File[] = [];
    let nextPageToken: string | undefined;

    do {
      const res = await this.driveClient.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields:
          'nextPageToken, files(id, name, mimeType, parents, webContentLink)',
        pageSize: 1000,
        pageToken: nextPageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const fetchedFiles = res.data.files || [];
      files = files.concat(fetchedFiles);
      nextPageToken = res.data.nextPageToken ?? undefined;

      // 🔥 Si el archivo es una carpeta, buscar sus hijos recursivamente
      for (const file of fetchedFiles) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          const subFiles = await this.getAllFilesRecursive(file.id!);
          files = files.concat(subFiles);
        }
      }
    } while (nextPageToken);

    return files;
  }

  private async buildTree(
    nodes: drive_v3.Schema$File[],
    parentId: string,
  ): Promise<GoogleDriveDirectoryDto> {
    let root = nodes.find((file) => file.id === parentId);
    if (!root) {
      root = await this.getFolderById(parentId);
    }

    const children = nodes.filter((file) => {
      return (
        file.parents && file.parents.includes(parentId) && file.id !== parentId
      );
    });

    const childDirectories: GoogleDriveDirectoryDto[] = [];
    const childFiles: drive_v3.Schema$File[] = [];

    for (const child of children) {
      if (child.mimeType === 'application/vnd.google-apps.folder') {
        const childTree = await this.buildTree(nodes, child.id!);
        childDirectories.push(childTree);
      } else {
        childFiles.push(child);
      }
    }

    return {
      id: root.id!,
      name: root.name!,
      directories: childDirectories,
      files: childFiles,
    };
  }

  async createFolder(
    name: string,
    parentId?: string | null,
  ): Promise<drive_v3.Schema$File> {
    const fileMetadata: drive_v3.Schema$File = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const response = await this.driveClient.files.create({
      requestBody: fileMetadata,
      fields: 'id, name',
    });

    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.driveClient.files.delete({
      fileId,
    });
  }

  async uploadFile(
    fileName: string,
    mimeType: string,
    fileBuffer: Buffer,
    parentId?: string,
  ): Promise<drive_v3.Schema$File> {
    console.log({ fileName, mimeType, fileBuffer, parentId });
    const fileMetadata: drive_v3.Schema$File = {
      name: fileName,
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await this.driveClient.files.create({
      supportsAllDrives: true,
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, parents',
    });

    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  }
}
