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
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 relative group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
      
      <div className="flex items-center mb-3">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-1.5 rounded-lg">
           <Sparkles className={`w-4 h-4 text-indigo-600 dark:text-indigo-400`} />
        </div>
        <h3 className={`font-bold text-sm text-slate-700 dark:text-slate-200 ${isRTL ? 'mr-2' : 'ml-2'}`}>{t.aiAssistant}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.aiPlaceholder}
            className={`w-full py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${isRTL ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
            />
            <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`absolute top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ${isRTL ? 'left-2' : 'right-2'}`}
            >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
            </button>
        </div>
      </form>
      <p className="text-[10px] text-slate-400 mt-2 font-medium">
        {t.aiHint}
      </p>
    </div>
  );
};