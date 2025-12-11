import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drivers'>('dashboard');
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

  // Stats (Using mock numbers for zero data scenario, or just 0)
  const activeRidesCount = rides.filter(r => r.status === RideStatus.IN_PROGRESS || r.status === RideStatus.PENDING).length;
  const availableDriversCount = drivers.filter(d => d.status === DriverStatus.AVAILABLE).length;
  const completedRidesCount = 0; 
  const totalRevenue = 0; 

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

  if (!isAuthenticated) {
    return (
      <>
        {/* Minimal Settings for Auth Screen */}
        <div className={`fixed top-4 z-50 flex gap-2 ${isRTL ? 'left-4' : 'right-4'}`}>
             <button 
                onClick={() => setLang(prev => prev === 'fa' ? 'en' : 'fa')}
                className="w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all text-[10px] font-bold"
              >
                {lang === 'fa' ? 'EN' : 'FA'}
              </button>
               <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
        </div>
        <Auth onLogin={handleLogin} lang={lang} />
      </>
    );
  }

  return (
    <div className={`flex h-screen bg-[#f8fafc] dark:bg-[#0b1120] font-sans transition-colors duration-300`}>
      
      {/* Sidebar - Minimal */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex z-10 shadow-sm">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-slate-900 dark:bg-white p-1.5 rounded-lg ml-3">
              <Car className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white hidden lg:block tracking-tight">{t.appTitle}</span>
          </div>
          
          <nav className="p-3 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${activeTab === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <LayoutDashboard className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <span className="font-medium text-sm hidden lg:block">{t.dashboard}</span>
            </button>
            <button 
              onClick={() => setActiveTab('drivers')}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${activeTab === 'drivers' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Users className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <span className="font-medium text-sm hidden lg:block">{t.drivers}</span>
            </button>
          </nav>
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
           <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <LogOut className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <span className="font-medium text-sm hidden lg:block">{t.logout}</span>
          </button>
          <button className="w-full flex items-center p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Settings className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <span className="font-medium text-sm hidden lg:block">{t.settings}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-3 z-50">
          <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('drivers')} className={`p-3 rounded-xl transition-colors ${activeTab === 'drivers' ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800' : 'text-slate-400'}`}>
            <Users className="w-6 h-6" />
          </button>
       </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header - Light & Clean */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center gap-4">
             {/* Small Settings - Moved Here */}
             <div className={`flex items-center gap-1.5 ${isRTL ? 'border-l pl-4' : 'border-r pr-4'} border-slate-200 dark:border-slate-800`}>
                <button 
                  onClick={() => setLang(prev => prev === 'fa' ? 'en' : 'fa')}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[10px] font-bold"
                >
                  {lang === 'fa' ? 'EN' : 'FA'}
                </button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
             </div>
             
             <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
               {activeTab === 'dashboard' ? t.dashboard : t.drivers}
             </h1>
          </div>
          
          <div className={`flex items-center gap-3 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
             <div className="relative hidden sm:block group">
               <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
               <input 
                 type="text" 
                 placeholder={t.search} 
                 className={`w-64 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
               />
             </div>
             <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                 <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">
                  {userRole === 'ADMIN' ? 'AD' : userRole === 'DRIVER' ? 'DR' : 'ST'}
                 </span>
             </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 md:pb-6 z-10 relative">
          
          {/* Top Stats */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title={t.activeRides} value={activeRidesCount} icon={Car} color="bg-blue-500" />
              <StatCard title={t.availDrivers} value={availableDriversCount} icon={Users} color="bg-green-500" />
              <StatCard title={t.todayRides} value={completedRidesCount} icon={Settings} color="bg-indigo-500" />
              <StatCard title={t.revenue} value={`${totalRevenue}`} icon={LayoutDashboard} color="bg-amber-500" />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-230px)]">
            
            {/* Left Panel: Lists & Input */}
            <div className={`w-full lg:w-1/3 flex flex-col lg:h-full`}>
              {activeTab === 'dashboard' && <AIChatInput onRideCreate={handleCreateRide} lang={lang} />}
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                   <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                     {activeTab === 'drivers' ? t.allDrivers : t.pendingRides}
                   </h3>
                   <span className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700 font-bold">
                     {activeTab === 'drivers' ? drivers.length : rides.filter(r => r.status === RideStatus.PENDING).length}
                   </span>
                </div>
                <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
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
            <div className={`w-full lg:w-2/3 lg:h-full hidden lg:block`}>
               <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
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