import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:shadow-lg transition-all duration-300">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{value}</h3>
        {trend && <p className="text-xs text-green-500 mt-2 font-bold bg-green-50 dark:bg-green-900/20 py-1 px-2 rounded-lg inline-block">{trend}</p>}
      </div>
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};