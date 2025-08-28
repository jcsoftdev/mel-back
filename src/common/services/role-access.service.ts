import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CacheEntry {
  data: {
    directSectionIds: string[];
    allSectionIds: string[];
    documentIds: string[];
  };
  timestamp: number;
}

@Injectable()
export class RoleAccessService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async getUserAccessibleSectionIds(userRoles: string[]): Promise<string[]> {
    if (!userRoles || userRoles.length === 0) {
      return [];
    }

    const roleAccess = await this.prisma.roleSectionAccess.findMany({
      where: {
        role: {
          name: {
            in: userRoles,
          },
        },
      },
      select: {
        sectionId: true,
      },
    });

    return roleAccess.map((access) => access.sectionId);
  }

  async getUserAccessibleDocumentIds(userRoles: string[]): Promise<string[]> {
    if (!userRoles || userRoles.length === 0) {
      return [];
    }

    const roleAccess = await this.prisma.roleDocumentAccess.findMany({
      where: {
        role: {
          name: {
            in: userRoles,
          },
        },
      },
      select: {
        documentId: true,
      },
    });

    return roleAccess.map((access) => access.documentId);
  }

  async canAccessSection(
    userRoles: string[],
    sectionId: string,
  ): Promise<boolean> {
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    const access = await this.prisma.roleSectionAccess.findFirst({
      where: {
        sectionId,
        role: {
          name: {
            in: userRoles,
          },
        },
      },
    });

    return !!access;
  }

  async canAccessDocument(
    userRoles: string[],
    documentId: string,
  ): Promise<boolean> {
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    const access = await this.prisma.roleDocumentAccess.findFirst({
      where: {
        documentId,
        role: {
          name: {
            in: userRoles,
          },
        },
      },
    });

    return !!access;
  }

  async getAccessibleSectionsWithDocuments(userRoles: string[]) {
    const accessibleSectionIds =
      await this.getUserAccessibleSectionIds(userRoles);
    const accessibleDocumentIds =
      await this.getUserAccessibleDocumentIds(userRoles);

    if (
      accessibleSectionIds.length === 0 &&
      accessibleDocumentIds.length === 0
    ) {
      return [];
    }

    const sections = await this.prisma.section.findMany({
      where: {
        id: {
          in: accessibleSectionIds,
        },
      },
      include: {
        parent: true,
        children: {
          where: {
            id: {
              in: accessibleSectionIds,
            },
          },
          include: {
            documents: {
              where: {
                id: {
                  in: accessibleDocumentIds,
                },
              },
            },
          },
        },
        documents: {
          where: {
            id: {
              in: accessibleDocumentIds,
            },
          },
        },
      },
    });

    return sections;
  }

  async getUserAccessibleSectionIdsWithParents(
    userRoles: string[],
  ): Promise<string[]> {
    const directAccessibleSectionIds =
      await this.getUserAccessibleSectionIds(userRoles);

    if (directAccessibleSectionIds.length === 0) {
      return [];
    }

    const allSectionIds = new Set(directAccessibleSectionIds);
    const parentSections = await this.getParentSectionsOptimized(
      directAccessibleSectionIds,
    );
    parentSections.forEach((parentId) => allSectionIds.add(parentId));

    return Array.from(allSectionIds);
  }

  private async getParentSectionsOptimized(
    sectionIds: string[],
  ): Promise<string[]> {
    const allParentIds = new Set<string>();
    const processedIds = new Set<string>();
    let currentIds = [...sectionIds];

    while (currentIds.length > 0) {
      const sections = await this.prisma.section.findMany({
        where: {
          id: { in: currentIds },
          parentId: { not: null },
        },
        select: { id: true, parentId: true },
      });

      const nextIds: string[] = [];
      for (const section of sections) {
        if (section.parentId && !processedIds.has(section.parentId)) {
          allParentIds.add(section.parentId);
          nextIds.push(section.parentId);
          processedIds.add(section.parentId);
        }
      }

      currentIds = nextIds;
    }

    return Array.from(allParentIds);
  }

  async getUserRoleAccessData(userRoles: string[]) {
    if (!userRoles || userRoles.length === 0) {
      return {
        directSectionIds: [],
        allSectionIds: [],
        documentIds: [],
      };
    }

    const cacheKey = userRoles.sort().join(',');
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const [sectionAccess, documentAccess] = await Promise.all([
      this.prisma.roleSectionAccess.findMany({
        where: {
          role: {
            name: {
              in: userRoles,
            },
          },
        },
        select: {
          sectionId: true,
        },
      }),
      this.prisma.roleDocumentAccess.findMany({
        where: {
          role: {
            name: {
              in: userRoles,
            },
          },
        },
        select: {
          documentId: true,
        },
      }),
    ]);

    const directSectionIds = sectionAccess.map((access) => access.sectionId);
    const documentIds = documentAccess.map((access) => access.documentId);

    let documentSectionIds: string[] = [];
    if (documentIds.length > 0) {
      const documentsWithSections = await this.prisma.document.findMany({
        where: {
          id: {
            in: documentIds,
          },
        },
        select: {
          sectionId: true,
        },
        distinct: ['sectionId'],
      });
      documentSectionIds = documentsWithSections.map((doc) => doc.sectionId);
    }

    const allDirectSectionIds = [
      ...new Set([...directSectionIds, ...documentSectionIds]),
    ];
    const parentSectionIds =
      await this.getParentSectionsOptimized(allDirectSectionIds);
    const allSectionIds = [...allDirectSectionIds, ...parentSectionIds];

    const result = {
      directSectionIds,
      allSectionIds,
      documentIds,
    };

    this.cache.set(cacheKey, {
      data: result,
      timestamp: now,
    });

    this.cleanupExpiredCache();

    return result;
  }

  private cleanupExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
