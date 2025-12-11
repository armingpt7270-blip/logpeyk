import React from 'react';
import { Ride, RideStatus, Driver } from '../types';
import { User, Clock, AlertCircle, ArrowRight, Banknote } from 'lucide-react';
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fa-IR');
  };

  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 opacity-60">
        <p className="font-bold text-lg">Empty List</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rides.map(ride => (
        <div key={ride.id} className="glass-card p-5 rounded-3xl relative group border-l-4" style={{ 
            borderLeftColor: ride.status === RideStatus.PENDING ? '#f59e0b' : ride.status === RideStatus.IN_PROGRESS ? '#3b82f6' : '#64748b' 
        }}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${ride.priority === 'URGENT' ? 'bg-red-500 text-white' : ride.priority === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}>
                   <span className="font-bold text-xs">{ride.priority === 'URGENT' ? '!!!' : ride.priority === 'HIGH' ? '!!' : '!'}</span>
               </div>
               <div>
                   <h4 className="font-bold text-slate-800 dark:text-white text-base">{ride.customerName}</h4>
                   <span className="text-[10px] text-slate-400 font-mono tracking-widest">#{ride.id.slice(-6).toUpperCase()}</span>
               </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md
                  ${ride.status === RideStatus.PENDING ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 
                    ride.status === RideStatus.IN_PROGRESS ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-slate-500/10 text-slate-500'}`}>
                  {t.status[ride.status]}
                </span>
                <span className="flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-lg">
                   {formatCurrency(ride.price)} تومان
                </span>
            </div>
          </div>

          <div className="space-y-2 mb-5 bg-white/50 dark:bg-slate-950/30 p-4 rounded-2xl border border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
               <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-1 flex-1">{ride.pickup.address}</p>
            </div>
            <div className={`w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-pink-500 mx-[3px] opacity-30`}></div>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.6)]"></div>
               <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-1 flex-1">{ride.dropoff.address}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-slate-500 font-bold bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
               <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
               {new Date(ride.requestedAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
            </div>
            
            {ride.status === RideStatus.PENDING && (
              <div className="flex gap-2">
                <button 
                  onClick={() => onCancelRide(ride.id)}
                  className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => handleSmartAssign(ride)}
                  disabled={loadingSuggestion === ride.id}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center disabled:opacity-70 disabled:scale-100"
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
               <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full border border-white/20">
                 <User className="w-3 h-3" />
                 {drivers.find(d => d.id === ride.driverId)?.name || '?'}
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};