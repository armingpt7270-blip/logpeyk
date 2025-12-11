import React from 'react';
import { Driver, DriverStatus } from '../types';
import { Car, Star, Navigation } from 'lucide-react';
import { translations } from '../utils/translations';

interface DriverListProps {
  drivers: Driver[];
  lang: 'fa' | 'en';
}

export const DriverList: React.FC<DriverListProps> = ({ drivers, lang }) => {
  const t = translations[lang];

  return (
    <div className="space-y-3">
      {drivers.map(driver => (
        <div key={driver.id} className="bg-white dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 flex items-center justify-between group">
          <div className="flex items-center">
            <div className="relative">
              <img src={driver.avatarUrl} alt={driver.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm" />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 
                ${driver.status === DriverStatus.AVAILABLE ? 'bg-green-500' : 
                  driver.status === DriverStatus.BUSY ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
            </div>
            <div className={`${lang === 'fa' ? 'mr-4' : 'ml-4'}`}>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{driver.name}</h4>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-3 mt-1">
                <span className="flex items-center bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md">
                  <Car className={`w-3 h-3 ${lang === 'fa' ? 'ml-1' : 'mr-1'}`} />
                  {driver.vehicleType}
                </span>
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className={`w-3 h-3 ${lang === 'fa' ? 'ml-1' : 'mr-1'} fill-current`} />
                  {driver.rating}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left flex flex-col items-end">
             <div className="flex items-center text-[10px] text-slate-400 mb-2 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg max-w-[100px] truncate">
               <Navigation className={`w-3 h-3 ${lang === 'fa' ? 'ml-1' : 'mr-1'}`} />
               {driver.location.address.split(',')[0]}
             </div>
             <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
               ${driver.status === DriverStatus.AVAILABLE ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                  driver.status === DriverStatus.BUSY ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
               {t.status[driver.status]}
             </span>
          </div>
        </div>
      ))}
    </div>
  );
};