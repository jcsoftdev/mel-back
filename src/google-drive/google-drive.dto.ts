export interface GoogleDriveDirectoryDto {
  id: string;
  name: string;
  downloadUrl?: string;
  directories?: GoogleDriveDirectoryDto[];
  files?: any[];
}
