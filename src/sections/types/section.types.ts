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
}

export interface SectionWithRelations {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  parent?: SectionWithRelations | null;
  children?: SectionWithRelations[];
  documents?: any[];
  roleGrants?: any[];
}
