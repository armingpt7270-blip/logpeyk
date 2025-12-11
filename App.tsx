import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  Car, 
  Settings, 
  Bell,
  Search,
  LogOut,
  Moon,
  Sun,
  Globe
} from 'lucide-react';

import { Ride, Driver, RideStatus, DriverStatus } from './types';
import { INITIAL_DRIVERS, INITIAL_RIDES } from './constants';
import { StatCard } from './components/StatCard';
import { MapComponent } from './components/MapComponent';
import { RideList } from './components/RideList';
import { DriverList } from './components/DriverList';
import { AIChatInput } from './components/AIChatInput';
import { Auth } from './components/Auth';
import { translations } from './utils/translations';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'DRIVER' | 'STORE'>('ADMIN');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rides' | 'drivers'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);

  const t = translations[lang];
  const isRTL = lang === 'fa';

  // Theme Toggling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Language Direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  // Stats
  const activeRidesCount = rides.filter(r => r.status === RideStatus.IN_PROGRESS || r.status === RideStatus.PENDING).length;
  const availableDriversCount = drivers.filter(d => d.status === DriverStatus.AVAILABLE).length;
  const completedRidesCount = 124; // Mock historic
  const totalRevenue = 3450000; // Mock historic in Toman

  const handleLogin = (role: 'ADMIN' | 'DRIVER' | 'STORE') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('ADMIN');
  };

  const handleCreateRide = (rideData: Partial<Ride>) => {
    const newRide: Ride = {
      id: `r${Date.now()}`,
      customerName: rideData.customerName || t.unknown,
      pickup: rideData.pickup!,
      dropoff: rideData.dropoff!,
      status: RideStatus.PENDING,
      price: rideData.price || 0,
      requestedAt: new Date(),
      priority: rideData.priority || 'NORMAL',
      notes: rideData.notes
    };
    setRides(prev => [newRide, ...prev]);
  };

  const handleAssignDriver = (rideId: string, driverId: string) => {
    setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: RideStatus.ASSIGNED, driverId } : r));
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: DriverStatus.BUSY, currentRideId: rideId } : d));
    
    setTimeout(() => {
      setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: RideStatus.IN_PROGRESS } : r));
    }, 2000);
  };

  const handleCancelRide = (rideId: string) => {
    const ride = rides.find(r => r.id === rideId);
    if (ride && ride.driverId) {
      setDrivers(prev => prev.map(d => d.id === ride.driverId ? { ...d, status: DriverStatus.AVAILABLE, currentRideId: undefined } : d));
    }
    setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: RideStatus.CANCELLED } : r));
  };

  // Top Bar Settings (Global)
  const SettingsBar = () => (
    <div className={`fixed top-4 z-50 flex gap-2 ${isRTL ? 'left-4' : 'right-4'}`}>
      <button 
        onClick={() => setLang(prev => prev === 'fa' ? 'en' : 'fa')}
        className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all"
        title="Change Language"
      >
        <span className="font-bold text-xs">{lang === 'fa' ? 'EN' : 'FA'}</span>
      </button>
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <>
        <SettingsBar />
        <Auth onLogin={handleLogin} lang={lang} />
      </>
    );
  }

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300`}>
      <SettingsBar />

      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-white dark:bg-slate-900 border-r border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex z-10 shadow-2xl shadow-indigo-500/5">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 ml-3">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white hidden lg:block tracking-tight">{t.appTitle}</span>
          </div>
          
          <nav className="p-4 space-y-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-200 group ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <LayoutDashboard className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'} transition-transform group-hover:scale-110`} />
              <span className="font-bold hidden lg:block">{t.dashboard}</span>
            </button>
            <button 
              onClick={() => setActiveTab('rides')}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-200 group ${activeTab === 'rides' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <MapIcon className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'} transition-transform group-hover:scale-110`} />
              <span className="font-bold hidden lg:block">{t.liveMap}</span>
            </button>
            <button 
              onClick={() => setActiveTab('drivers')}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-200 group ${activeTab === 'drivers' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Users className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'} transition-transform group-hover:scale-110`} />
              <span className="font-bold hidden lg:block">{t.drivers}</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
           <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <span className="font-bold hidden lg:block">{t.logout}</span>
          </button>
          <button className="w-full flex items-center p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Settings className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <span className="font-bold hidden lg:block">{t.settings}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-3 z-50 backdrop-blur-lg bg-opacity-90">
          <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('rides')} className={`p-3 rounded-xl transition-colors ${activeTab === 'rides' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}>
            <MapIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('drivers')} className={`p-3 rounded-xl transition-colors ${activeTab === 'drivers' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}>
            <Users className="w-6 h-6" />
          </button>
       </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none"></div>

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 z-10 relative">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight capitalize">
            {activeTab === 'dashboard' ? t.dashboard : activeTab === 'rides' ? t.liveMap : t.drivers}
          </h1>
          <div className={`flex items-center gap-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
             <div className="relative hidden sm:block group">
               <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
               <input 
                 type="text" 
                 placeholder={t.search} 
                 className={`w-64 py-2.5 bg-white dark:bg-slate-800 rounded-full text-sm shadow-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
               />
             </div>
             <button className="relative p-2.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
             </button>
             <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5">
                   <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                     <span className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                      {userRole === 'ADMIN' ? 'AD' : userRole === 'DRIVER' ? 'DR' : 'ST'}
                     </span>
                   </div>
                </div>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 md:pb-6 z-10 relative">
          
          {/* Top Stats */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title={t.activeRides} value={activeRidesCount} icon={Car} color="bg-blue-500" trend="+12%" />
              <StatCard title={t.availDrivers} value={availableDriversCount} icon={Users} color="bg-green-500" />
              <StatCard title={t.todayRides} value={completedRidesCount} icon={MapIcon} color="bg-indigo-500" trend="+5%" />
              <StatCard title={t.revenue} value={`${(totalRevenue/1000).toLocaleString()} K`} icon={LayoutDashboard} color="bg-amber-500" trend="+8%" />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)]">
            
            {/* Left Panel: Lists & Input */}
            <div className={`w-full lg:w-1/3 flex flex-col lg:h-full ${activeTab === 'rides' ? 'hidden lg:flex' : 'flex'}`}>
              <AIChatInput onRideCreate={handleCreateRide} lang={lang} />
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden transition-colors">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800 dark:text-white">
                     {activeTab === 'drivers' ? t.allDrivers : t.pendingRides}
                   </h3>
                   <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">
                     {activeTab === 'drivers' ? drivers.length : rides.filter(r => r.status === RideStatus.PENDING).length}
                   </span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                   {activeTab === 'drivers' ? (
                     <DriverList drivers={drivers} lang={lang} />
                   ) : (
                     <RideList 
                       rides={rides.filter(r => r.status === RideStatus.PENDING || r.status === RideStatus.IN_PROGRESS)} 
                       drivers={drivers}
                       onAssignDriver={handleAssignDriver}
                       onCancelRide={handleCancelRide}
                       lang={lang}
                     />
                   )}
                </div>
              </div>
            </div>

            {/* Right Panel: Map */}
            <div className={`w-full lg:w-2/3 lg:h-full ${activeTab === 'dashboard' || activeTab === 'rides' ? 'flex-1' : 'hidden lg:block'}`}>
               <div className="h-full min-h-[400px]">
                  <MapComponent drivers={drivers} rides={rides} isDarkMode={isDarkMode} lang={lang} />
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;