import { Workspace, Share, PaginatedResponse, ProcessedWorkspaceData, MemberShare, AccessLevel } from '../types';

const API_BASE_URL = 'https://api.smartsheet.com/2.0';

async function apiFetch<T>(endpoint: string, apiKey: string): Promise<T> {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  // Using a proxy to bypass browser CORS restrictions. Public proxies can be unreliable
  // and are a common source of network errors (like 'Failed to fetch').
  // In a real production app, a dedicated server-side proxy is the recommended approach.
  const proxyUrl = 'https://cors.eu.org/';
  const targetUrl = `${API_BASE_URL}${endpoint}`.replace(/^https?:\/\//, '');


  const response = await fetch(`${proxyUrl}${targetUrl}`, { headers });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = `API Error: ${errorBody.message || errorMessage} (Code: ${errorBody.errorCode})`;
    } catch (e) {
      // Ignore if error body is not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}


async function listWorkspaces(apiKey: string): Promise<Workspace[]> {
  const response = await apiFetch<PaginatedResponse<Workspace>>('/workspaces', apiKey);
  return response.data;
}

async function getWorkspaceDetails(workspaceId: number, apiKey:string): Promise<Workspace> {
    return apiFetch<Workspace>(`/workspaces/${workspaceId}`, apiKey);
}

async function getWorkspaceShares(workspaceId: number, apiKey: string): Promise<Share[]> {
  const response = await apiFetch<PaginatedResponse<Share>>(`/workspaces/${workspaceId}/shares`, apiKey);
  return response.data;
}

export async function fetchAndProcessWorkspaces(apiKey: string): Promise<ProcessedWorkspaceData[]> {
  const workspaces = await listWorkspaces(apiKey);
  
  const dataPromises = workspaces.map(async (workspace) => {
    // The initial workspace list doesn't include `createdAt`, so we fetch full details.
    // We run the fetches for shares and details in parallel for efficiency.
    const [shares, workspaceDetails] = await Promise.all([
      getWorkspaceShares(workspace.id, apiKey),
      getWorkspaceDetails(workspace.id, apiKey)
    ]);
    
    let owner = 'N/A';
    const memberShares: MemberShare[] = [];

    shares.forEach(share => {
      const identity = share.email || share.name || 'Group/Unknown';
      if (share.accessLevel === 'OWNER') {
        owner = identity;
      } else {
        memberShares.push({
            identity,
            accessLevel: share.accessLevel
        });
      }
    });

    return {
      id: workspaceDetails.id,
      workspaceName: workspaceDetails.name,
      owner,
      createdAt: workspaceDetails.createdAt,
      shares: memberShares
    };
  });

  const processedData = await Promise.all(dataPromises);
  return processedData.sort((a, b) => a.workspaceName.localeCompare(b.workspaceName));
}
