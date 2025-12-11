import React, { useState } from 'react';
import { Sparkles, ArrowUp, Loader2 } from 'lucide-react';
import { parseNaturalLanguageRide } from '../services/geminiService';
import { Ride } from '../types';
import { translations } from '../utils/translations';

interface AIChatInputProps {
  onRideCreate: (rideData: Partial<Ride>) => void;
  lang: 'fa' | 'en';
}

export const AIChatInput: React.FC<AIChatInputProps> = ({ onRideCreate, lang }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const t = translations[lang];
  const isRTL = lang === 'fa';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    const result = await parseNaturalLanguageRide(input);
    
    if (result) {
      const newRideData: Partial<Ride> = {
        customerName: result.customerName || t.unknown,
        pickup: { 
          lat: 35.6892 + (Math.random() - 0.5) * 0.05, 
          lng: 51.3890 + (Math.random() - 0.5) * 0.05,
          address: result.pickupAddress 
        },
        dropoff: { 
          lat: 35.6892 + (Math.random() - 0.5) * 0.05, 
          lng: 51.3890 + (Math.random() - 0.5) * 0.05,
          address: result.dropoffAddress 
        },
        priority: result.priority,
        notes: result.notes,
        price: 50000 + Math.random() * 50000, 
      };
      
      onRideCreate(newRideData);
      setInput('');
    } else {
      alert(lang === 'fa' ? "متاسفانه متوجه درخواست نشدم." : "Could not understand request.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="relative group">
       <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
       <div className="relative glass-panel rounded-3xl p-2 pl-3 flex items-center border border-white/50 dark:border-white/10 shadow-xl">
           <div className="bg-indigo-500 text-white p-2.5 rounded-2xl mr-2 ml-1 animate-pulse">
               <Sparkles className="w-5 h-5" />
           </div>
           
           <form onSubmit={handleSubmit} className="flex-1 flex items-center">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={t.aiPlaceholder}
               className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 font-medium px-3 text-sm h-12"
             />
             <button
               type="submit"
               disabled={!input.trim() || isProcessing}
               className={`p-3 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center
                 ${!input.trim() 
                   ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' 
                   : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-500/40'}`}
             >
               {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
             </button>
           </form>
       </div>
    </div>
  );
};