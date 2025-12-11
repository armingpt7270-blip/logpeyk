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
  // Extract color class base name to apply light backgrounds (e.g. bg-blue-500 -> text-blue-600 bg-blue-50)
  const colorClassMap: Record<string, string> = {
    'bg-blue-500': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    'bg-green-500': 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    'bg-indigo-500': 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400',
    'bg-amber-500': 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  };

  const iconStyle = colorClassMap[color] || 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">{title}</p>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
        {trend && <p className="text-[10px] text-emerald-500 mt-1 font-bold flex items-center">{trend}</p>}
      </div>
      <div className={`p-3 rounded-xl ${iconStyle}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};