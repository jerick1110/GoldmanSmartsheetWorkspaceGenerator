export interface Workspace {
  id: number;
  name: string;
  createdAt: string;
}

export type AccessLevel = 'OWNER' | 'ADMIN' | 'EDITOR' | 'COMMENTER' | 'VIEWER';

export interface Share {
  id: string;
  type: string;
  scope: string;
  email?: string;
  name?: string;
  accessLevel: AccessLevel;
  createdAt: string;
  modifiedAt: string;
}

export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  data: T[];
}

export interface MemberShare {
  identity: string;
  accessLevel: AccessLevel;
}

export interface ProcessedWorkspaceData {
  id: number;
  workspaceName: string;
  owner: string;
  createdAt: string;
  shares: MemberShare[];
}
