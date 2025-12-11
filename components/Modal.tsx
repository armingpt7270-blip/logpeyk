import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  lang: 'fa' | 'en';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Heavy Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 overflow-hidden" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-slate-700/50">
          <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};