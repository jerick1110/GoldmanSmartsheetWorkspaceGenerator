import React, { useState, useMemo, useCallback } from 'react';
import { ProcessedWorkspaceData } from '../types';

interface WorkspaceTableProps {
  data: ProcessedWorkspaceData[];
}

const PermissionBadge: React.FC<{ permission: string }> = ({ permission }) => {
    const colorClasses: { [key: string]: string } = {
        'OWNER': 'bg-red-500 text-red-100',
        'ADMIN': 'bg-purple-500 text-purple-100',
        'EDITOR': 'bg-blue-500 text-blue-100',
        'COMMENTER': 'bg-yellow-500 text-yellow-100',
        'VIEWER': 'bg-green-500 text-green-100',
    };
    const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
    return <span className={`${baseClasses} ${colorClasses[permission] || 'bg-gray-500 text-gray-100'}`}>{permission}</span>;
}

const formatDate = (dateString: string): string => {
    if (!dateString) {
        return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString();
}


const WorkspaceTable: React.FC<WorkspaceTableProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) {
            return data;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return data.filter(item =>
            item.workspaceName.toLowerCase().includes(lowercasedFilter) ||
            item.owner.toLowerCase().includes(lowercasedFilter) ||
            item.members.some(member => member.toLowerCase().includes(lowercasedFilter))
        );
    }, [data, searchTerm]);

    const handleDownloadCsv = useCallback(() => {
        const headers = ['Workspace Name', 'Owner', 'Date Created', 'Members', 'Permissions'];
        const rows = filteredData.map(item => [
            `"${item.workspaceName.replace(/"/g, '""')}"`,
            `"${item.owner.replace(/"/g, '""')}"`,
            `"${formatDate(item.createdAt)}"`,
            `"${item.members.join('; ').replace(/"/g, '""')}"`,
            `"${item.permissions.join('; ').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-t;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'smartsheet_workspaces.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [filteredData]);


    return (
        <div className="bg-gray-800 shadow-lg rounded-xl overflow-hidden">
             <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white self-start sm:self-center">Workspace Report</h2>
                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Filter workspaces..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
                        Download CSV
                    </button>
                 </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Workspace Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Owner</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date Created</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Members</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Permissions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.workspaceName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.owner}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(item.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-300 max-w-xs">
                                        <div className="flex flex-wrap gap-2">
                                            {item.members.length > 0 ? item.members.map((member, index) => (
                                                 <span key={index} className="bg-gray-600 text-gray-200 px-2.5 py-1 text-xs font-medium rounded-full">{member}</span>
                                            )) : <span className="text-gray-500">No other members</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                         <div className="flex flex-col items-start gap-2">
                                            {item.permissions.length > 0 ? item.permissions.map((permission, index) => (
                                                 <PermissionBadge key={index} permission={permission} />
                                            )): <span className="text-gray-500 italic text-xs">N/A</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-16 px-6 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-white">No Results</h3>
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