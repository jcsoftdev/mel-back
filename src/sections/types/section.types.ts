import { Section } from '@prisma/client';

export interface SectionTree {
  id: string;
  name: string;
  parentId: string | null;
  children: SectionTree[];
  documentCount: number;
  documents: {
    id: string;
    title: string;
    url: string;
    driveId?: string | null;
    sectionId: string;
    createdAt: Date;
  }[];
  forms: {
    id: string;
    driveId: string;
  }[];
  formsCount: number;
  driveId: string | null;
}

// export interface SectionWithRelations {
//   id: string;
//   name: string;
//   parentId: string | null;
//   createdAt: Date;
//   parent?: SectionWithRelations | null;
//   children?: SectionWithRelations[];
//   documents?: any[];
//   roleGrants?: any[];
// }

export interface SectionWithRelations extends Section {
  parent?: Section | null;
  children?: SectionWithRelations[];
  documents?: {
    id: string;
    title: string;
    url: string;
    driveId?: string | null;
    sectionId: string;
    createdAt: Date;
  }[];
  forms?: {
    id: string;
    driveId: string;
  }[];
  roleGrants?: any[];
}
