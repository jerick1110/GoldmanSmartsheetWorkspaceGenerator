import React, { useMemo } from 'react';
import { ProcessedWorkspaceData, AccessLevel } from '../types';

interface DashboardProps {
    data: ProcessedWorkspaceData[];
}

const StatCard: React.FC<{ title: string; value?: string | number; icon?: React.ReactNode; children?: React.ReactNode }> = ({ title, value, icon, children }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl shadow-lg flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
            {icon}
        </div>
        {value !== undefined && <p className="mt-1 text-3xl font-semibold text-white">{value}</p>}
        {children}
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const stats = useMemo(() => {
        const totalWorkspaces = data.length;
        
        const collaborators = new Set<string>();
        const permissionCounts: { [key in AccessLevel]?: number } = {};

        data.forEach(workspace => {
            collaborators.add(workspace.owner);
            workspace.shares.forEach(share => {
                collaborators.add(share.identity);
                permissionCounts[share.accessLevel] = (permissionCounts[share.accessLevel] || 0) + 1;
            });
        });

        return {
            totalWorkspaces,
            totalUniqueCollaborators: collaborators.size,
            permissionCounts
        };
    }, [data]);

    const permissionOrder: AccessLevel[] = ['ADMIN', 'EDITOR', 'COMMENTER', 'VIEWER'];
    
    const iconClass = "w-6 h-6 text-gray-500";

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">High-Level Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Workspaces" 
                    value={stats.totalWorkspaces} 
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    }
                />
                <StatCard 
                    title="Unique Collaborators" 
                    value={stats.totalUniqueCollaborators}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
                <StatCard 
                    title="Permissions Breakdown"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                >
                    <div className="mt-2 space-y-2">
                        {permissionOrder.map(level => {
                            const count = stats.permissionCounts[level] || 0;
                            if (count === 0) return null;
                            return (
                                <div key={level} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">{level}S</span>
                                    <span className="font-semibold text-gold-400 bg-gray-700 px-2 py-0.5 rounded">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </StatCard>
            </div>
        </div>
    );
};

export default Dashboard;