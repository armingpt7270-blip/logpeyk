import React, { useState, useEffect } from 'react';
import { User, Truck, Store, Lock, ArrowLeft, Phone, MapPin, Eye, EyeOff, CheckSquare, Square, Mail, Fingerprint, PhoneCall, Locate, Car, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { translations } from '../utils/translations';
import { MAP_CENTER } from '../constants';
import { db } from '../services/database';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const InputWrapper = ({ children }: { children?: React.ReactNode }) => (
  <div className="relative group transition-all duration-300">
     {children}
  </div>
);

const LocationPicker = ({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (pos: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
};

// New Component for Auto Geolocation on Load
const AutoLocate = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
    const map = useMap();
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 15);
                // Optionally set the marker immediately, or just center the map
                // onLocate(latitude, longitude); // Uncomment if you want to set the pin immediately
            });
        }
    }, [map]);
    return null;
};

const LocateControl = ({ onLocate, lang }: { onLocate: (lat: number, lng: number) => void, lang: 'fa' | 'en' }) => {
  const map = useMap();
  const t = translations[lang];

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!navigator.geolocation) {
       alert("Geolocation not supported");
       return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 15);
        onLocate(latitude, longitude);
      },
      (err) => {
        console.error(err);
        alert(lang === 'fa' ? 'دسترسی به موقعیت مکانی امکان‌پذیر نیست' : 'Could not get your location');
      }
    );
  };
  return (
    <div className="absolute bottom-3 right-3 z-[1000]">
      <button 
        onClick={handleLocate}
        type="button"
        className="bg-white/90 backdrop-blur text-blue-600 p-2.5 rounded-xl shadow-lg hover:scale-105 transition-all border border-blue-100"
        title={t.locateMe}
      >
        <Locate className="w-5 h-5" />
      </button>
    </div>
  );
};

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

  const initialRegData = {
    name: '', ownerName: '', emailOrUser: '', mobile: '', landline: '', nationalId: '', vehicleType: 'Motor', password: '', confirmPassword: '', address: '', location: null as { lat: number, lng: number } | null
  };
  const [regData, setRegData] = useState(initialRegData);

  useEffect(() => {
    const creds = db.getCredentials();
    if (creds) setUsername(creds.username || '');
  }, []);

  const resetForm = () => { setRegData(initialRegData); setError(''); };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Admin Check
    if (username === 'armin7270' && password === 'ARmin@#8840028*') {
      if (rememberMe) db.saveCredentials(username, 'ADMIN');
      onLogin('ADMIN');
      return;
    }

    // Test Users
    if (username === 'test_store' && password === '123456') {
      if (rememberMe) db.saveCredentials(username, 'STORE');
      onLogin('STORE');
      return;
    }

    if (username === 'test_driver' && password === '123456') {
      if (rememberMe) db.saveCredentials(username, 'DRIVER');
      onLogin('DRIVER');
      return;
    }

    if (!username || !password) {
      setError(lang === 'fa' ? 'لطفا نام کاربری و رمز عبور را وارد کنید.' : 'Please enter username and password.');
      return;
    }
    
    // Generic Fallback for demo
    let role: 'STORE' | 'DRIVER' = 'DRIVER';
    if (username.toLowerCase().includes('store') || username.toLowerCase().includes('shop')) role = 'STORE';
    if (rememberMe) db.saveCredentials(username, role);
    onLogin(role);
  };

  const loginAsTest = (role: 'ADMIN' | 'STORE' | 'DRIVER') => {
      if (role === 'ADMIN') { setUsername('armin7270'); setPassword('ARmin@#8840028*'); }
      if (role === 'STORE') { setUsername('test_store'); setPassword('123456'); }
      if (role === 'DRIVER') { setUsername('test_driver'); setPassword('123456'); }
  };

  const handleRegisterSubmit = (e: React.FormEvent, isDriver: boolean) => {
    e.preventDefault();
    setError('');
    if (!regData.name || !regData.mobile || !regData.emailOrUser || !regData.password || !regData.address) { setError(t.fillAll); return; }
    if (regData.password !== regData.confirmPassword) { setError(t.passwordsNotMatch); return; }
    if (!regData.location) { setError(t.locationRequired); return; }
    if (isDriver) {
        if (!regData.nationalId || !regData.vehicleType) { setError(lang === 'fa' ? 'اطلاعات ناقص است' : 'Missing info'); return; }
    } else {
        if (!regData.ownerName) { setError(lang === 'fa' ? 'نام صاحب فروشگاه الزامی است' : 'Owner Name required'); return; }
    }
    alert(lang === 'fa' ? 'اطلاعات با موفقیت ثبت شد.' : 'Registration successful.');
    setView('LOGIN');
    resetForm();
  };

  const isRTL = lang === 'fa';
  const inputClass = `w-full py-4 bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm font-bold dark:text-white backdrop-blur-sm ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} shadow-sm`;

  const renderLogin = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 px-1 uppercase tracking-wider">{t.username}</label>
        <InputWrapper>
          <User className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
        </InputWrapper>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 px-1 uppercase tracking-wider">{t.password}</label>
        <InputWrapper>
          <Lock className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}>
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </InputWrapper>
      </div>

      <div className="flex items-center cursor-pointer pt-2" onClick={() => setRememberMe(!rememberMe)}>
        <div className={`transition-colors ${rememberMe ? 'text-blue-600' : 'text-slate-300'}`}>
          {rememberMe ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
        </div>
        <span className="mx-2 text-sm text-slate-600 dark:text-slate-300 font-medium select-none">{t.rememberMe}</span>
      </div>
      
      {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-200 text-center">{error}</div>}

      <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 mt-2 tracking-wide uppercase">
        {t.login}
      </button>

      {/* Quick Login Buttons for Testing */}
      <div className="grid grid-cols-3 gap-2 mt-4">
         <button type="button" onClick={() => loginAsTest('ADMIN')} className="text-[10px] py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 font-bold hover:bg-slate-200">تست ادمین</button>
         <button type="button" onClick={() => loginAsTest('STORE')} className="text-[10px] py-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 font-bold hover:bg-purple-200">تست فروشگاه</button>
         <button type="button" onClick={() => loginAsTest('DRIVER')} className="text-[10px] py-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 font-bold hover:bg-amber-200">تست سفیر</button>
      </div>

      <div className="mt-8 text-center pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
        <p className="text-xs font-bold text-slate-400 mb-2">{t.noAccount}</p>
        <button type="button" onClick={() => setView('REGISTER_SELECTION')} className="text-sm font-black text-blue-600 hover:text-blue-700 transition-colors">
          {t.register}
        </button>
      </div>
    </form>
  );

  const renderRegisterSelection = () => (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center mb-6 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setView('LOGIN')}>
        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2 rotate-180'}`} />
        <span className="text-sm font-bold">{t.backToLogin}</span>
      </div>
      
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 text-center">{t.registerTitle}</h3>

      <button onClick={() => { resetForm(); setView('REGISTER_DRIVER'); }} className="w-full flex items-center p-5 border border-transparent bg-white/60 dark:bg-slate-800/50 rounded-3xl hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 transition-all group text-right shadow-sm hover:shadow-xl">
          <div className="bg-blue-50 dark:bg-slate-900 p-4 rounded-2xl text-blue-600 dark:text-slate-300 group-hover:text-blue-700 shadow-sm ml-4 transition-colors">
              <Truck className="w-8 h-8" />
          </div>
          <div className="flex-1">
              <span className="block font-bold text-slate-800 dark:text-white text-base mb-1">{t.driverReg}</span>
              <span className="text-xs font-medium text-slate-500">{t.driverDesc}</span>
          </div>
      </button>

      <button onClick={() => { resetForm(); setView('REGISTER_STORE'); }} className="w-full flex items-center p-5 border border-transparent bg-white/60 dark:bg-slate-800/50 rounded-3xl hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 transition-all group text-right shadow-sm hover:shadow-xl">
          <div className="bg-purple-50 dark:bg-slate-900 p-4 rounded-2xl text-purple-600 dark:text-slate-300 group-hover:text-purple-700 shadow-sm ml-4 transition-colors">
              <Store className="w-8 h-8" />
          </div>
          <div className="flex-1">
              <span className="block font-bold text-slate-800 dark:text-white text-base mb-1">{t.storeReg}</span>
              <span className="text-xs font-medium text-slate-500">{t.storeDesc}</span>
          </div>
      </button>
    </div>
  );

  const renderRegistrationForm = (isDriver: boolean) => (
    <div className="space-y-4 animate-in slide-in-from-right-8 duration-500">
        <div className="flex items-center mb-6 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setView('REGISTER_SELECTION')}>
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2 rotate-180'}`} />
            <span className="text-sm font-bold">{t.backToLogin}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input type="text" placeholder={isDriver ? t.fullName : t.storeName} value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className={inputClass} />
             <input type="text" placeholder={t.emailOrUser} value={regData.emailOrUser} onChange={e => setRegData({...regData, emailOrUser: e.target.value})} className={inputClass} dir="ltr" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="tel" placeholder={t.mobile} value={regData.mobile} onChange={e => setRegData({...regData, mobile: e.target.value})} className={inputClass} dir="ltr" />
            {isDriver ? (
                 <select value={regData.vehicleType} onChange={e => setRegData({...regData, vehicleType: e.target.value})} className={inputClass}>
                    <option value="Motor">{t.vehicle.motor}</option>
                    <option value="Car">{t.vehicle.car}</option>
                    <option value="Van">{t.vehicle.van}</option>
                 </select>
            ) : (
                <input type="text" placeholder={t.ownerName} value={regData.ownerName} onChange={e => setRegData({...regData, ownerName: e.target.value})} className={inputClass} />
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="password" placeholder={t.password} value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className={inputClass} />
            <input type="password" placeholder={t.confirmPassword} value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} className={inputClass} />
        </div>

        <textarea placeholder={t.exactAddress} rows={2} value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} className={inputClass} />

        <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
             <MapContainer center={MAP_CENTER} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <AutoLocate onLocate={(lat, lng) => setRegData(prev => ({ ...prev, location: { lat, lng } }))} />
                <LocationPicker position={regData.location} setPosition={(pos) => setRegData({...regData, location: pos})} />
                <LocateControl onLocate={(lat, lng) => setRegData(prev => ({ ...prev, location: { lat, lng } }))} lang={lang} />
             </MapContainer>
             {!regData.location && <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-900/10"><span className="text-xs bg-white/90 px-3 py-1.5 rounded-full shadow font-bold text-red-500">{t.selectMap}</span></div>}
        </div>
        
        {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
        <button onClick={(e) => handleRegisterSubmit(e, isDriver)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all">{t.submitReg}</button>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-md glass-panel p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
             {/* Decorative top bar */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
             
             <div className="text-center mb-8 relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 mb-5 transform rotate-3 hover:rotate-12 transition-all duration-500">
                    <Truck className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{t.appTitle}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{t.subtitle}</p>
             </div>

             {view === 'LOGIN' && renderLogin()}
             {view === 'REGISTER_SELECTION' && renderRegisterSelection()}
             {view === 'REGISTER_DRIVER' && renderRegistrationForm(true)}
             {view === 'REGISTER_STORE' && renderRegistrationForm(false)}
        </div>
    </div>
  );
};