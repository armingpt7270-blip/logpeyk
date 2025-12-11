import React, { useState, useEffect } from 'react';
import { User, Truck, Store, Lock, ArrowLeft, Phone, MapPin, Eye, EyeOff, CheckSquare, Square, Mail, Fingerprint, PhoneCall, Locate, Car } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { translations } from '../utils/translations';
import { MAP_CENTER } from '../constants';
import { db } from '../services/database'; // Import Database

// Fix Leaflet marker icon safely
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

// Location Picker Component for Map
const LocationPicker = ({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (pos: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
};

// Locate Control for Registration Map
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
        className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
        title={t.locateMe}
      >
        <Locate className="w-4 h-4" />
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
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Registration State
  const initialRegData = {
    name: '', // Full Name or Store Name
    ownerName: '', // For Store
    emailOrUser: '',
    mobile: '',
    landline: '', // For Store
    nationalId: '', // For Driver
    vehicleType: 'Motor', // For Driver
    password: '',
    confirmPassword: '',
    address: '',
    location: null as { lat: number, lng: number } | null
  };
  const [regData, setRegData] = useState(initialRegData);

  // Check storage on mount
  useEffect(() => {
    const creds = db.getCredentials();
    if (creds) {
       // Auto-fill logic could go here or direct login in App.tsx
       setUsername(creds.username || '');
    }
  }, []);

  const resetForm = () => {
    setRegData(initialRegData);
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'armin7270' && password === 'ARmin@#8840028*') {
      if (rememberMe) db.saveCredentials(username, 'ADMIN');
      onLogin('ADMIN');
      return;
    }

    if (!username || !password) {
      setError(lang === 'fa' ? 'لطفا نام کاربری و رمز عبور را وارد کنید.' : 'Please enter username and password.');
      return;
    }

    let role: 'STORE' | 'DRIVER' = 'DRIVER';
    if (username.toLowerCase().includes('store') || username.toLowerCase().includes('shop')) {
        role = 'STORE';
    } 
    
    if (rememberMe) db.saveCredentials(username, role);
    onLogin(role);
  };

  const handleRegisterSubmit = (e: React.FormEvent, isDriver: boolean) => {
    e.preventDefault();
    setError('');

    // Common Validation
    if (!regData.name || !regData.mobile || !regData.emailOrUser || !regData.password || !regData.address || !regData.location) {
      setError(t.fillAll);
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setError(t.passwordsNotMatch);
      return;
    }

    // Specific Validation
    if (isDriver) {
        if (!regData.nationalId || !regData.vehicleType) {
            setError(t.fillAll);
            return;
        }
    } else {
        // Store
        if (!regData.ownerName) {
            setError(t.fillAll);
            return;
        }
    }

    // Success Simulation
    alert(lang === 'fa' ? 'اطلاعات با موفقیت ثبت شد.' : 'Registration successful.');
    setView('LOGIN');
    resetForm();
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

      <button onClick={() => { resetForm(); setView('REGISTER_DRIVER'); }} className="w-full flex items-center p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-right shadow-sm hover:shadow-md">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors ml-4">
              <Truck className="w-6 h-6" />
          </div>
          <div className="flex-1">
              <span className="block font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">{t.driverReg}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{t.driverDesc}</span>
          </div>
      </button>

      <button onClick={() => { resetForm(); setView('REGISTER_STORE'); }} className="w-full flex items-center p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-right shadow-sm hover:shadow-md">
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

      {/* Grid for compact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">
              {isDriver ? t.fullName : t.storeName}
            </label>
            <InputWrapper>
              <User className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
              <input type="text" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
            </InputWrapper>
          </div>
          
          {isDriver ? (
             <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.nationalId}</label>
                <InputWrapper>
                <Fingerprint className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
                <input type="text" value={regData.nationalId} onChange={e => setRegData({...regData, nationalId: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white text-right ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" />
                </InputWrapper>
            </div>
          ) : (
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.ownerName}</label>
                <InputWrapper>
                <User className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
                <input type="text" value={regData.ownerName} onChange={e => setRegData({...regData, ownerName: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
                </InputWrapper>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.mobile}</label>
            <InputWrapper>
            <Phone className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="tel" value={regData.mobile} onChange={e => setRegData({...regData, mobile: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white text-right ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" placeholder="09..." />
            </InputWrapper>
        </div>
        {isDriver ? (
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.vehicleType}</label>
                <InputWrapper>
                    <Car className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
                    <select value={regData.vehicleType} onChange={e => setRegData({...regData, vehicleType: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}>
                        <option value="Motor">{t.vehicle.motor}</option>
                        <option value="Car">{t.vehicle.car}</option>
                        <option value="Van">{t.vehicle.van}</option>
                    </select>
                </InputWrapper>
            </div>
        ) : (
             <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.landline}</label>
                <InputWrapper>
                <PhoneCall className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
                <input type="tel" value={regData.landline} onChange={e => setRegData({...regData, landline: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white text-right ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" placeholder="021..." />
                </InputWrapper>
            </div>
        )}
      </div>

      {/* Account Info */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.emailOrUser}</label>
        <InputWrapper>
          <Mail className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
          <input type="text" value={regData.emailOrUser} onChange={e => setRegData({...regData, emailOrUser: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} dir="ltr" />
        </InputWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.password}</label>
            <InputWrapper>
            <Lock className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
            </InputWrapper>
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.confirmPassword}</label>
            <InputWrapper>
            <Lock className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
            <input type="password" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
            </InputWrapper>
        </div>
      </div>

      {/* Address & Map */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">{t.exactAddress}</label>
          <InputWrapper>
             <MapPin className={`w-4 h-4 absolute top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
             <textarea rows={2} value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} />
          </InputWrapper>
          
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 mb-1.5 px-1">{t.selectMap}</label>
          <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-0">
             <MapContainer center={MAP_CENTER} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <LocationPicker 
                   position={regData.location} 
                   setPosition={(pos) => setRegData({...regData, location: pos})} 
                />
                <LocateControl onLocate={(lat, lng) => setRegData(prev => ({ ...prev, location: { lat, lng } }))} lang={lang} />
             </MapContainer>
             {!regData.location && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-900/10 z-[400]">
                    <span className="text-xs bg-white/80 px-2 py-1 rounded shadow text-slate-600">{t.selectMap}</span>
                 </div>
             )}
          </div>
      </div>

      {error && <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>}

      <button onClick={(e) => handleRegisterSubmit(e, isDriver)} className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-xl font-bold shadow-sm transition-all duration-200 mt-2">
        {t.submitReg}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
       <div className="min-h-full flex items-center justify-center p-4 relative">
         {/* Background decoration */}
         <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 -z-20 pointer-events-none"></div>
         <div className="fixed -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
         <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

         <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="p-8">
               {/* Logo Header */}
               <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">{t.appTitle}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.subtitle}</p>
               </div>

               {/* Dynamic Content */}
               <div className="relative min-h-[300px]">
                  {view === 'LOGIN' && renderLogin()}
                  {view === 'REGISTER_SELECTION' && renderRegisterSelection()}
                  {view === 'REGISTER_DRIVER' && renderRegistrationForm(true)}
                  {view === 'REGISTER_STORE' && renderRegistrationForm(false)}
               </div>
            </div>
         </div>
       </div>
    </div>
  );
};
