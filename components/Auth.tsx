import React, { useState } from 'react';
import { User, Truck, Store, Lock, ArrowLeft, Phone, MapPin, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { translations } from '../utils/translations';

const InputWrapper = ({ children }: { children?: React.ReactNode }) => (
  <div className="relative group transition-all duration-300">
     {children}
  </div>
);

type AuthView = 'LOGIN' | 'REGISTER_SELECTION' | 'REGISTER_DRIVER' | 'REGISTER_STORE';

interface AuthProps {
  onLogin: (role: 'ADMIN' | 'DRIVER' | 'STORE') => void;
  lang: 'fa' | 'en';
}

export const Auth: React.FC<AuthProps> = ({ onLogin, lang }) => {
  const t = translations[lang];
  const [view, setView] = useState<AuthView>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'armin7270' && password === 'ARmin@#8840028*') {
      onLogin('ADMIN');
      return;
    }

    if (!username || !password) {
      setError(lang === 'fa' ? 'لطفا نام کاربری و رمز عبور را وارد کنید.' : 'Please enter username and password.');
      return;
    }

    if (username.toLowerCase().includes('store') || username.toLowerCase().includes('shop')) {
        onLogin('STORE');
    } else {
        onLogin('DRIVER');
    }
  };

  const isRTL = lang === 'fa';

  const renderLogin = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.username}</label>
        <InputWrapper>
          <User className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
            placeholder="" 
          />
        </InputWrapper>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.password}</label>
        <InputWrapper>
          <Lock className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'}`}
            placeholder="" 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </InputWrapper>
      </div>

      <div className="flex items-center cursor-pointer pt-1" onClick={() => setRememberMe(!rememberMe)}>
        <div className={`transition-colors ${rememberMe ? 'text-indigo-600' : 'text-slate-300'}`}>
          {rememberMe ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </div>
        <span className="mx-2 text-xs text-slate-500 dark:text-slate-400 select-none">{t.rememberMe}</span>
      </div>
      
      {error && <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>}

      <button type="submit" className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-xl font-bold shadow-sm transform transition-all duration-200 mt-2">
        {t.login}
      </button>

      <div className="mt-6 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-400 mb-2">{t.noAccount}</p>
        <button type="button" onClick={() => setView('REGISTER_SELECTION')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
          {t.register}
        </button>
      </div>
    </form>
  );

  const renderRegisterSelection = () => (
    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center mb-4 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => setView('LOGIN')}>
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2 rotate-180'}`} />
        <span className="text-xs font-bold">{t.backToLogin}</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">{t.registerTitle}</h3>

      <button onClick={() => setView('REGISTER_DRIVER')} className="w-full flex items-center p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-right shadow-sm hover:shadow-md">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors ml-4">
              <Truck className="w-6 h-6" />
          </div>
          <div className="flex-1">
              <span className="block font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">{t.driverReg}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{t.driverDesc}</span>
          </div>
      </button>

      <button onClick={() => setView('REGISTER_STORE')} className="w-full flex items-center p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-right shadow-sm hover:shadow-md">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors ml-4">
              <Store className="w-6 h-6" />
          </div>
          <div className="flex-1">
              <span className="block font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">{t.storeReg}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{t.storeDesc}</span>
          </div>
      </button>
    </div>
  );

  const renderRegistrationForm = (isDriver: boolean) => (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center mb-4 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => setView('REGISTER_SELECTION')}>
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2 rotate-180'}`} />
        <span className="text-xs font-bold">{t.backToLogin}</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
        {isDriver ? t.driverReg : t.storeReg}
      </h3>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">
          {isDriver ? t.fullName : t.storeName}
        </label>
        <InputWrapper>
          <User className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="text" className={`w-full py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
        </InputWrapper>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.mobile}</label>
        <InputWrapper>
          <Phone className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="tel" className={`w-full py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium dark:text-white text-right ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" placeholder="0912..." />
        </InputWrapper>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.password}</label>
        <InputWrapper>
          <Lock className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="password" className={`w-full py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
        </InputWrapper>
      </div>

      <button onClick={() => { alert('Submitted'); setView('LOGIN'); }} className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-xl font-bold shadow-sm transition-all duration-200 mt-2">
        {t.submitReg}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f172a] flex items-center justify-center p-4 font-sans transition-colors duration-300" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Header - Minimalist */}
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 mb-4">
              <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">{t.appTitle}</h1>
          <p className="text-slate-400 text-xs font-medium">{t.subtitle}</p>
        </div>

        <div className="p-8">
          {view === 'LOGIN' && renderLogin()}
          {view === 'REGISTER_SELECTION' && renderRegisterSelection()}
          {view === 'REGISTER_DRIVER' && renderRegistrationForm(true)}
          {view === 'REGISTER_STORE' && renderRegistrationForm(false)}
        </div>
      </div>
    </div>
  );
};