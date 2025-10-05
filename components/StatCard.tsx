import React from 'react';

interface StatCardProps {
  icon: React.ReactElement;
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4 border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

export default StatCard;