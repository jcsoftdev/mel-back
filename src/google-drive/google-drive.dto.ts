export interface GoogleDriveDirectoryDto {
  id: string;
  name: string;
  mimeType: string;
  downloadUrl?: string;
  children?: GoogleDriveDirectoryDto[];
}
