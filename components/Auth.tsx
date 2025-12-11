import React, { useState } from 'react';
import { User, Truck, Store, Lock, ArrowLeft, Phone, MapPin, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { translations } from '../utils/translations';

const InputWrapper = ({ children }: { children: React.ReactNode }) => (
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
    <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 px-1">{t.username}</label>
        <InputWrapper>
          <User className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
            placeholder="User / Phone" 
          />
        </InputWrapper>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 px-1">{t.password}</label>
        <InputWrapper>
          <Lock className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
            placeholder="••••••••" 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </InputWrapper>
      </div>

      <div className="flex items-center cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
        <div className={`transition-colors ${rememberMe ? 'text-primary-600' : 'text-slate-400'}`}>
          {rememberMe ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
        </div>
        <span className="mx-2 text-sm text-slate-600 dark:text-slate-400 select-none">{t.rememberMe}</span>
      </div>
      
      {error && <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}

      <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all duration-200">
        {t.login}
      </button>

      <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.noAccount}</p>
        <button type="button" onClick={() => setView('REGISTER_SELECTION')} className="text-sm font-bold text-primary-600 hover:text-primary-500 transition-colors">
          {t.register}
        </button>
      </div>
    </form>
  );

  const renderRegisterSelection = () => (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center mb-6 text-slate-500 hover:text-primary-600 transition-colors cursor-pointer" onClick={() => setView('LOGIN')}>
        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2 rotate-180'}`} />
        <span className="text-sm font-bold">{t.backToLogin}</span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">{t.registerTitle}</h3>

      <button onClick={() => setView('REGISTER_DRIVER')} className="w-full flex items-center p-5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-3xl hover:border-primary-500 dark:hover:border-primary-500 hover:bg-white dark:hover:bg-slate-800 transition-all group text-right shadow-sm hover:shadow-md">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 ml-4">
              <Truck className="w-7 h-7" />
          </div>
          <div className="flex-1">
              <span className="block font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{t.driverReg}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.driverDesc}</span>
          </div>
      </button>

      <button onClick={() => setView('REGISTER_STORE')} className="w-full flex items-center p-5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-3xl hover:border-amber-500 dark:hover:border-amber-500 hover:bg-white dark:hover:bg-slate-800 transition-all group text-right shadow-sm hover:shadow-md">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 ml-4">
              <Store className="w-7 h-7" />
          </div>
          <div className="flex-1">
              <span className="block font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{t.storeReg}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.storeDesc}</span>
          </div>
      </button>
    </div>
  );

  const renderRegistrationForm = (isDriver: boolean) => (
    <div className="space-y-5 animate-in slide-in-from-right-8 duration-500">
      <div className="flex items-center mb-4 text-slate-500 hover:text-primary-600 transition-colors cursor-pointer" onClick={() => setView('REGISTER_SELECTION')}>
        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2 rotate-180'}`} />
        <span className="text-sm font-bold">{t.backToLogin}</span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
        {isDriver ? t.driverReg : t.storeReg}
      </h3>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 px-1">
          {isDriver ? t.fullName : t.storeName}
        </label>
        <InputWrapper>
          <User className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="text" className={`w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} />
        </InputWrapper>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 px-1">{t.mobile}</label>
        <InputWrapper>
          <Phone className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="tel" className={`w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium dark:text-white text-right ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} dir="ltr" placeholder="0912..." />
        </InputWrapper>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 px-1">{t.password}</label>
        <InputWrapper>
          <Lock className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="password" className={`w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} />
        </InputWrapper>
      </div>

      {isDriver ? (
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 px-1">{t.vehicleType}</label>
          <div className="relative group">
            <Truck className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
            <select className={`w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium dark:text-white appearance-none ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}>
              <option>Motorcycle</option>
              <option>Sedan (Pride/Tiba)</option>
              <option>Sedan (Peugeot/Samand)</option>
              <option>Pickup Truck</option>
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 px-1">{t.address}</label>
          <InputWrapper>
            <MapPin className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="text" className={`w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium dark:text-white ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} />
          </InputWrapper>
        </div>
      )}

      <button onClick={() => { alert('Submitted'); setView('LOGIN'); }} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-500/30 transition-all duration-200 mt-4">
        {t.submitReg}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans transition-colors duration-300" dir={isRTL ? "rtl" : "ltr"}>
      <div className="glass w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50 relative">
        
        {/* Decorative elements */}
        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md shadow-inner border border-white/30">
                <Truck className="text-white w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">{t.appTitle}</h1>
            <p className="text-indigo-100 text-sm font-medium opacity-90">{t.subtitle}</p>
          </div>
        </div>

        <div className="p-8 relative z-10">
          {view === 'LOGIN' && renderLogin()}
          {view === 'REGISTER_SELECTION' && renderRegisterSelection()}
          {view === 'REGISTER_DRIVER' && renderRegistrationForm(true)}
          {view === 'REGISTER_STORE' && renderRegistrationForm(false)}
        </div>
      </div>
    </div>
  );
};