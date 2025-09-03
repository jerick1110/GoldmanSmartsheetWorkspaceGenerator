import React, { useState, useMemo, useCallback } from 'react';
import { ProcessedWorkspaceData, AccessLevel } from '../types';

type SortableKeys = 'workspaceName' | 'owner' | 'createdAt';

interface WorkspaceTableProps {
  data: ProcessedWorkspaceData[];
}

const PermissionBadge: React.FC<{ permission: AccessLevel }> = ({ permission }) => {
    const colorClasses: { [key in AccessLevel]: string } = {
        'OWNER': 'bg-red-500/80 text-red-100',
        'ADMIN': 'bg-purple-500/80 text-purple-100',
        'EDITOR': 'bg-blue-500/80 text-blue-100',
        'COMMENTER': 'bg-gold-500/80 text-gold-100',
        'VIEWER': 'bg-green-500/80 text-green-100',
    };
    const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
    return <span className={`${baseClasses} ${colorClasses[permission] || 'bg-gray-500/80 text-gray-100'}`}>{permission}</span>;
}

const formatDate = (dateString: string): string => {
    try {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
}

const SortableHeader: React.FC<{
    title: string;
    sortKey: SortableKeys;
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
    requestSort: (key: SortableKeys) => void;
}> = ({ title, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = sortConfig?.direction === 'ascending' ? '▲' : '▼';
    
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">
                <span>{title}</span>
                {isSorted && <span className="ml-2 text-gold-400">{directionIcon}</span>}
            </div>
        </th>
    );
};


const WorkspaceTable: React.FC<WorkspaceTableProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'workspaceName', direction: 'ascending' });
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowercasedFilter = searchTerm.toLowerCase();
        return data.filter(item =>
            item.workspaceName.toLowerCase().includes(lowercasedFilter) ||
            item.owner.toLowerCase().includes(lowercasedFilter) ||
            item.shares.some(share => share.identity.toLowerCase().includes(lowercasedFilter))
        );
    }, [data, searchTerm]);
    
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const toggleRowExpansion = (id: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDownloadCsv = useCallback(() => {
        const headers = ['Workspace ID', 'Workspace Name', 'Owner', 'Date Created', 'Shared To', 'Permission Level'];
        
        const rows: string[][] = [];

        sortedData.forEach(item => {
             item.shares.forEach(share => {
                rows.push([
                    `"${item.id}"`,
                    `"${item.workspaceName.replace(/"/g, '""')}"`,
                    `"${item.owner.replace(/"/g, '""')}"`,
                    `"${formatDate(item.createdAt)}"`,
                    `"${share.identity.replace(/"/g, '""')}"`,
                    `"${share.accessLevel}"`
                ]);
            });
             if (item.shares.length === 0) {
                 rows.push([
                    `"${item.id}"`,
                    `"${item.workspaceName.replace(/"/g, '""')}"`,
                    `"${item.owner.replace(/"/g, '""')}"`,
                    `"${formatDate(item.createdAt)}"`,
                    `"N/A"`,
                    `"N/A"`
                ]);
             }
        });

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'goldman_smartsheet_workspaces.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [sortedData]);


    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg rounded-xl overflow-hidden">
             <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-700/50">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Filter results..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition duration-200"
                        aria-label="Filter workspaces"
                    />
                </div>
                <button
                    onClick={handleDownloadCsv}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Enhanced CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700/50">
                    <thead className="bg-gray-700/40">
                        <tr>
                            <th scope="col" className="w-12 px-6 py-3"></th>
                            <SortableHeader title="Workspace Name" sortKey="workspaceName" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader title="Owner" sortKey="owner" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader title="Date Created" sortKey="createdAt" sortConfig={sortConfig} requestSort={requestSort} />
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shared With</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-700/50">
                        {sortedData.length > 0 ? (
                            sortedData.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className="hover:bg-gray-700/60 transition-colors duration-200">
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleRowExpansion(item.id)} className="text-gray-400 hover:text-white" aria-expanded={expandedRows.has(item.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedRows.has(item.id) ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.workspaceName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.owner}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(item.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.shares.length} Collaborator{item.shares.length !== 1 && 's'}</td>
                                    </tr>
                                    {expandedRows.has(item.id) && (
                                        <tr className="bg-gray-900/10">
                                            <td colSpan={5} className="p-0">
                                                <div className="p-4 bg-gray-900/30">
                                                    {item.shares.length > 0 ? (
                                                        <table className="min-w-full">
                                                            <thead className="sr-only">
                                                                <tr><th>Collaborator</th><th>Permission</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.shares.map((share, index) => (
                                                                    <tr key={index}>
                                                                        <td className="px-4 py-2 text-sm text-gray-300 w-2/3">{share.identity}</td>
                                                                        <td className="px-4 py-2 text-sm text-gray-300 w-1/3"><PermissionBadge permission={share.accessLevel} /></td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p className="px-4 py-2 text-center text-sm text-gray-500">No other collaborators in this workspace.</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-16 px-6 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-semibold text-white">No Results</h3>
                                        <p className="mt-1 text-sm text-gray-500">No workspaces found matching your filter.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkspaceTable;