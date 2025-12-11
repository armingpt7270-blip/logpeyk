import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
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
      alert(lang === 'fa' ? "متاسفانه متوجه درخواست نشدم. لطفا دوباره تلاش کنید." : "Could not understand request. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-slate-900 p-6 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 text-white relative overflow-hidden group">
      {/* Animated background sheen */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
      
      <div className="flex items-center mb-4 relative z-10">
        <Sparkles className={`w-5 h-5 text-yellow-300 animate-pulse ${isRTL ? 'ml-2' : 'mr-2'}`} />
        <h3 className="font-bold text-sm tracking-wide">{t.aiAssistant}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="relative">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.aiPlaceholder}
            className={`w-full py-4 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md transition-all shadow-inner ${isRTL ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
            />
            <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`absolute top-1/2 -translate-y-1/2 p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all shadow-lg ${isRTL ? 'left-2' : 'right-2'}`}
            >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className={`w-4 h-4 ${!isRTL && 'rotate-180'}`} />}
            </button>
        </div>
      </form>
      <p className="text-[10px] text-indigo-200 mt-3 opacity-80 font-medium relative z-10">
        {t.aiHint}
      </p>
    </div>
  );
};