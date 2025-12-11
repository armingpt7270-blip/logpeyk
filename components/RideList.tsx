import React from 'react';
import { Ride, RideStatus, Driver } from '../types';
import { User, Clock, AlertCircle } from 'lucide-react';
import { suggestDriverWithAI } from '../services/geminiService';
import { translations } from '../utils/translations';

interface RideListProps {
  rides: Ride[];
  drivers: Driver[];
  onAssignDriver: (rideId: string, driverId: string) => void;
  onCancelRide: (rideId: string) => void;
  lang: 'fa' | 'en';
}

export const RideList: React.FC<RideListProps> = ({ rides, drivers, onAssignDriver, onCancelRide, lang }) => {
  const [loadingSuggestion, setLoadingSuggestion] = React.useState<string | null>(null);
  const t = translations[lang];

  const handleSmartAssign = async (ride: Ride) => {
    setLoadingSuggestion(ride.id);
    const suggestedDriverId = await suggestDriverWithAI(ride, drivers);
    setLoadingSuggestion(null);

    if (suggestedDriverId) {
      onAssignDriver(ride.id, suggestedDriverId);
    } else {
      alert(lang === 'fa' ? "سفیر مناسبی در حال حاضر یافت نشد." : "No suitable driver found.");
    }
  };

  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
        <p>Empty List</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rides.map(ride => (
        <div key={ride.id} className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-900 group">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border 
                ${ride.priority === 'URGENT' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' : 
                  ride.priority === 'HIGH' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30'}`}>
                {t.priority[ride.priority]}
              </span>
              <span className="text-xs text-slate-400 font-mono opacity-70">#{ride.id.slice(-4).toUpperCase()}</span>
            </div>
            <span className={`text-xs font-bold 
              ${ride.status === RideStatus.PENDING ? 'text-amber-500' : 
                ride.status === RideStatus.IN_PROGRESS ? 'text-blue-500' : 'text-slate-500'}`}>
              {t.status[ride.status]}
            </span>
          </div>
          
          <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center mb-3">
            <User className={`w-3.5 h-3.5 ${lang === 'fa' ? 'ml-2' : 'mr-2'} text-slate-400`} />
            {ride.customerName}
          </h4>

          <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
            <div className="flex items-start">
              <div className={`flex flex-col items-center ${lang === 'fa' ? 'ml-3' : 'mr-3'} mt-1`}>
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700 my-1"></div>
                <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]"></div>
              </div>
              <div className="text-xs space-y-3 flex-1">
                <p className="text-slate-600 dark:text-slate-300 font-medium line-clamp-1">{ride.pickup.address}</p>
                <p className="text-slate-600 dark:text-slate-300 font-medium line-clamp-1">{ride.dropoff.address}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center text-xs text-slate-400 font-medium">
               <Clock className={`w-3.5 h-3.5 ${lang === 'fa' ? 'ml-1' : 'mr-1'}`} />
               {new Date(ride.requestedAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
            </div>
            
            {ride.status === RideStatus.PENDING && (
              <div className="flex gap-2">
                <button 
                  onClick={() => onCancelRide(ride.id)}
                  className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => handleSmartAssign(ride)}
                  disabled={loadingSuggestion === ride.id}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center disabled:opacity-70"
                >
                  {loadingSuggestion === ride.id ? (
                     <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                    {lang === 'fa' ? t.assignSmart : t.assignSmart}
                    <AlertCircle className={`w-3.5 h-3.5 ${lang === 'fa' ? 'mr-1.5' : 'ml-1.5'}`} />
                    </>
                  )}
                </button>
              </div>
            )}
             {ride.status !== RideStatus.PENDING && ride.driverId && (
               <div className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                 Driver: {drivers.find(d => d.id === ride.driverId)?.name || '?'}
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};