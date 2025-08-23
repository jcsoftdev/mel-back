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
    files: drive_v3.Schema$File[],
    parentId: string,
  ): Promise<GoogleDriveDirectoryDto> {
    type TreeNode = drive_v3.Schema$File & { children?: TreeNode[] };

    const map = new Map<string, TreeNode>(
      files.map((file) => [file.id!, file]),
    );

    const root = await this.getFolderById(parentId);

    const buildTreeRecursively = (
      parent: TreeNode,
    ): GoogleDriveDirectoryDto => {
      console.log({ parent });
      const children = map.values();
      const data: GoogleDriveDirectoryDto[] = [];
      for (const child of children) {
        console.log({ child, parent });
        if (child.parents?.includes(parent.id!)) {
          if (child.mimeType === 'application/vnd.google-apps.folder') {
            const childNode = buildTreeRecursively(child);
            data.push(childNode);
          } else {
            data.push({
              id: child.id!,
              name: child.name!,
              mimeType: child.mimeType!,
              downloadUrl:
                child.webContentLink! ??
                `https://drive.google.com/uc?id=${child.id}`,
            });
          }
          map.delete(child.id!);
        }
      }
      return {
        id: parent.id!,
        name: parent.name!,
        mimeType: parent.mimeType!,
        children: data,
      };
    };

    return buildTreeRecursively(root);
  }
}
