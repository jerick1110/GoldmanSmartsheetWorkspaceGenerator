
export interface Workspace {
  id: number;
  name: string;
  createdAt: string;
}

export interface Share {
  id: string;
  type: string;
  scope: string;
  email?: string;
  name?: string;
  accessLevel: 'OWNER' | 'ADMIN' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
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

export interface ProcessedWorkspaceData {
  id: number;
  workspaceName: string;
  owner: string;
  createdAt: string;
  members: string[];
  permissions: string[];
}