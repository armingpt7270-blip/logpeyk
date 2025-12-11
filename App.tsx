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
  Store as StoreIcon,
  Package,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  CheckCircle,
  XCircle,
  Power,
  MapPin,
  PlusCircle,
  Menu,
  ChevronRight
} from 'lucide-react';

import { Ride, Driver, RideStatus, DriverStatus, Customer, Store } from './types';
import { db } from './services/database';
import { StatCard } from './components/StatCard';
import { RideList } from './components/RideList';
import { DriverList } from './components/DriverList';
import { AIChatInput } from './components/AIChatInput';
import { Auth } from './components/Auth';
import { Modal } from './components/Modal';
import { OrderMapPicker } from './components/OrderMapPicker';
import { LocationMapPicker } from './components/LocationMapPicker';
import { translations } from './utils/translations';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'DRIVER' | 'STORE'>('ADMIN');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drivers' | 'customers' | 'stores' | 'orders'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data State
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ADD_DRIVER' | 'ADD_CUSTOMER' | 'ADD_STORE' | 'EDIT_STORE' | 'ADD_ORDER' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Map Picker State
  const [mapPickerMode, setMapPickerMode] = useState<'pickup' | 'dropoff' | null>(null);
  const [mapCoords, setMapCoords] = useState<{ pickup: {lat: number, lng: number} | null, dropoff: {lat: number, lng: number} | null }>({ pickup: null, dropoff: null });

  const t = translations[lang];
  const isRTL = lang === 'fa';

  useEffect(() => {
    setDrivers(db.getDrivers());
    setRides(db.getRides());
    setCustomers(db.getCustomers());
    setStores(db.getStores());

    const savedAuth = db.getCredentials();
    if (savedAuth) {
        setIsAuthenticated(true);
        setUserRole(savedAuth.role as any);
    }
  }, []);

  useEffect(() => { if(drivers.length) db.saveDrivers(drivers); }, [drivers]);
  useEffect(() => { if(rides.length) db.saveRides(rides); }, [rides]);
  useEffect(() => { if(customers.length) db.saveCustomers(customers); }, [customers]);
  useEffect(() => { if(stores.length) db.saveStores(stores); }, [stores]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const handleLogin = (role: 'ADMIN' | 'DRIVER' | 'STORE') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('ADMIN');
    db.clearCredentials();
  };

  // --- Handlers (Keep logic same, update UI later) ---
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: Driver = {
      id: `d${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      vehicleType: formData.vehicleType,
      status: DriverStatus.AVAILABLE,
      rating: 5.0,
      avatarUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
      location: { lat: 35.6892 + (Math.random() - 0.5) * 0.05, lng: 51.3890 + (Math.random() - 0.5) * 0.05, address: 'Tehran' }
    };
    setDrivers([...drivers, newDriver]);
    closeModal();
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm(t.delete + '?')) setDrivers(drivers.filter(d => d.id !== id));
  };

  const handleToggleDriverStatus = (id: string) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, status: d.status === DriverStatus.OFFLINE ? DriverStatus.AVAILABLE : DriverStatus.OFFLINE } : d));
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      location: formData.location
    };
    setCustomers([...customers, newCustomer]);
    closeModal();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm(t.delete + '?')) setCustomers(customers.filter(c => c.id !== id));
  };

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    const newStore: Store = {
      id: `s${Date.now()}`,
      name: formData.name,
      owner: formData.owner,
      phone: formData.phone,
      address: formData.address
    };
    setStores([...stores, newStore]);
    closeModal();
  };

  const handleEditStore = (e: React.FormEvent) => {
    e.preventDefault();
    setStores(stores.map(s => s.id === selectedItem.id ? { ...s, ...formData } : s));
    closeModal();
  };

  const handleDeleteStore = (id: string) => {
    if (confirm(t.delete + '?')) setStores(stores.filter(s => s.id !== id));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    const store = stores.find(s => s.id === formData.storeId);
    
    const pickupCoords = mapCoords.pickup || { lat: 35.6892, lng: 51.3890 };
    const defaultDropoff = customer?.location || { lat: 35.7000, lng: 51.4000 };
    const dropoffCoords = mapCoords.dropoff || defaultDropoff;

    const newRide: Ride = {
      id: `r${Date.now()}`,
      customerName: customer ? customer.name : (store ? store.name : t.unknown),
      customerId: formData.customerId,
      storeId: formData.storeId,
      pickup: { ...pickupCoords, address: formData.pickupAddress || (store?.address || 'Tehran') },
      dropoff: { ...dropoffCoords, address: formData.dropoffAddress || (customer?.address || 'Tehran') },
      status: RideStatus.PENDING,
      price: Number(formData.price) || 50000,
      requestedAt: new Date(),
      priority: formData.priority || 'NORMAL',
      notes: formData.notes
    };
    setRides([newRide, ...rides]);
    closeModal();
  };

  const handleAICreateRide = (rideData: Partial<Ride>) => {
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
    setRides(prev => prev.filter(r => r.id !== rideId));
  };

  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setMapCoords({ pickup: null, dropoff: null });
    setMapPickerMode(null);
    if (type === 'ADD_ORDER' && item?.customerId) {
        const c = customers.find(cust => cust.id === item.customerId);
        if (c && c.location) setMapCoords(prev => ({ ...prev, dropoff: c.location! }));
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedItem(null);
    setFormData({});
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="flex flex-col h-full space-y-6">
        <div className="w-full mx-auto animate-in slide-in-from-bottom-5 duration-500">
             <AIChatInput onRideCreate={handleAICreateRide} lang={lang} />
        </div>

        <div className="glass-panel rounded-3xl flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-700 delay-100 border-0">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
             <div className="flex items-center gap-4">
                 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                     <Package className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">{t.activeRides}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.pendingRides}: {rides.filter(r => r.status === RideStatus.PENDING).length}</p>
                 </div>
             </div>
             <button onClick={() => openModal('ADD_ORDER')} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl text-sm font-bold hover:scale-105 transition-all shadow-lg">
                <Plus className="w-4 h-4" /> {t.add}
             </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
             <RideList 
               rides={rides.filter(r => r.status === RideStatus.PENDING || r.status === RideStatus.IN_PROGRESS || r.status === RideStatus.ASSIGNED)} 
               drivers={drivers}
               onAssignDriver={handleAssignDriver}
               onCancelRide={handleCancelRide}
               lang={lang}
             />
          </div>
        </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="glass-panel rounded-3xl overflow-hidden h-full flex flex-col animate-in fade-in duration-500">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">{t.drivers}</h3>
        <button onClick={() => openModal('ADD_DRIVER')} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">
          <Plus className="w-4 h-4" /> {t.add}
        </button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map(d => (
            <div key={d.id} className="glass-card p-5 rounded-3xl relative group">
                <div className="flex items-center gap-4 mb-3">
                    <div className="relative">
                        <img src={d.avatarUrl} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${d.status === 'AVAILABLE' ? 'bg-green-500' : d.status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{d.name}</h4>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{d.vehicleType} • ⭐ {d.rating}</p>
                    </div>
                </div>
                <div className="flex justify-between items-end">
                     <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${d.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : d.status === 'BUSY' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {t.status[d.status]}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleToggleDriverStatus(d.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"><Power className="w-4 h-4 text-slate-600 dark:text-slate-300" /></button>
                        <button onClick={() => handleDeleteDriver(d.id)} className="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="glass-panel rounded-3xl overflow-hidden h-full flex flex-col animate-in fade-in duration-500">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">{t.customers}</h3>
        <button onClick={() => openModal('ADD_CUSTOMER')} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">
          <Plus className="w-4 h-4" /> {t.add}
        </button>
      </div>
      <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-right border-separate border-spacing-y-2 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-bold opacity-70">{t.name}</th>
              <th className="px-6 py-4 font-bold opacity-70">{t.phone}</th>
              <th className="px-6 py-4 font-bold opacity-70">{t.address}</th>
              <th className="px-6 py-4 font-bold opacity-70 w-32">{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="glass-card rounded-2xl group">
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white rounded-r-2xl">{c.name}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium font-mono">{c.phone}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-xs">{c.address}</td>
                <td className="px-6 py-4 rounded-l-2xl">
                   <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal('ADD_ORDER', { customerId: c.id, dropoffAddress: c.address })} className="text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2 rounded-xl transition-colors"><PlusCircle className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteCustomer(c.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStores = () => (
    <div className="glass-panel rounded-3xl overflow-hidden h-full flex flex-col animate-in fade-in duration-500">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">{t.stores}</h3>
        <button onClick={() => openModal('ADD_STORE')} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">
          <Plus className="w-4 h-4" /> {t.add}
        </button>
      </div>
       <div className="p-6 overflow-y-auto custom-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(s => (
            <div key={s.id} className="glass-card p-6 rounded-3xl relative group">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                        <StoreIcon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('EDIT_STORE', s)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteStore(s.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>
                <h4 className="font-bold text-xl text-slate-800 dark:text-white mb-1">{s.name}</h4>
                <p className="text-xs font-bold text-indigo-500 mb-3 uppercase tracking-wider">{s.owner}</p>
                <div className="space-y-2 mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2"><Users className="w-4 h-4 opacity-50" /> {s.phone}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 line-clamp-1"><MapPin className="w-4 h-4 opacity-50" /> {s.address}</p>
                </div>
                <button onClick={() => openModal('ADD_ORDER', { storeId: s.id, pickupAddress: s.address })} className="w-full py-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors">
                    {t.manualOrder}
                </button>
            </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="glass-panel rounded-3xl overflow-hidden h-full flex flex-col animate-in fade-in duration-500">
       <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <h3 className="font-bold text-xl text-slate-800 dark:text-white">{t.orders}</h3>
          <button onClick={() => openModal('ADD_ORDER')} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">
            <Plus className="w-4 h-4" /> {t.add}
          </button>
       </div>
       <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <RideList 
            rides={rides}
            drivers={drivers}
            onAssignDriver={handleAssignDriver}
            onCancelRide={handleCancelRide}
            lang={lang}
          />
       </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-900">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          </div>
          <div className={`fixed top-6 z-50 flex gap-3 ${isRTL ? 'left-6' : 'right-6'}`}>
             <button onClick={() => setLang(prev => prev === 'fa' ? 'en' : 'fa')} className="glass-panel px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform text-xs font-bold">{lang === 'fa' ? 'EN' : 'FA'}</button>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="glass-panel p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
        </div>
        <Auth onLogin={handleLogin} lang={lang} />
      </div>
    );
  }

  const inputClass = "w-full py-3 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/10 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all dark:text-white backdrop-blur-sm";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 px-1";

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'orders', icon: Package, label: t.orders },
    { id: 'drivers', icon: Car, label: t.drivers },
    { id: 'customers', icon: Users, label: t.customers },
    { id: 'stores', icon: StoreIcon, label: t.stores },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-900 dark:text-slate-100 font-sans relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-[-1] animated-bg opacity-20 dark:opacity-30"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-overlay"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-overlay"></div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-20 lg:w-72 h-[calc(100vh-2rem)] m-4 glass-panel rounded-[2rem] shadow-2xl z-20 transition-all duration-300">
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30">
                 <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl text-slate-800 dark:text-white hidden lg:block tracking-tight ml-4 mr-4">RiderAI</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
           {navItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id as any)}
               className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'}`}
             >
                <item.icon className={`w-6 h-6 z-10 ${isRTL ? 'ml-3' : 'mr-3'} ${activeTab === item.id ? 'animate-pulse' : ''}`} />
                <span className="font-bold text-sm hidden lg:block z-10">{item.label}</span>
                {activeTab === item.id && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-100 z-0"></div>}
             </button>
           ))}
        </nav>

        <div className="p-4 mt-auto">
            <button onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start p-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-5 h-5 lg:mr-3 lg:ml-3" />
                <span className="font-bold text-sm hidden lg:block">{t.logout}</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
         {/* Mobile Header */}
         <header className="h-20 flex items-center justify-between px-6 md:px-8 mt-4 md:mt-0">
             <div className="flex items-center gap-4">
                 <div className="md:hidden bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl backdrop-blur-md border border-white/20">
                     <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">
                        {activeTab === 'dashboard' ? t.dashboard : activeTab === 'drivers' ? t.drivers : activeTab === 'customers' ? t.customers : activeTab === 'stores' ? t.stores : t.orders}
                    </h1>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest opacity-70">Overview</p>
                 </div>
             </div>

             <div className="flex items-center gap-3">
                 <div className="hidden md:flex items-center gap-2 bg-white/30 dark:bg-slate-800/30 p-1 rounded-2xl backdrop-blur-md border border-white/10 shadow-sm">
                    <button onClick={() => setLang('fa')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${lang === 'fa' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>FA</button>
                    <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>EN</button>
                 </div>
                 <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 flex items-center justify-center bg-white/30 dark:bg-slate-800/30 rounded-2xl backdrop-blur-md border border-white/10 hover:scale-105 transition-transform shadow-sm text-slate-700 dark:text-slate-200">
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
                 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-pink-500/30">
                     {userRole === 'ADMIN' ? 'AD' : 'US'}
                 </div>
             </div>
         </header>

         {/* Content View */}
         <div className="flex-1 p-4 md:p-6 md:pt-2 overflow-hidden">
             {activeTab === 'dashboard' && renderDashboard()}
             {activeTab === 'drivers' && renderDrivers()}
             {activeTab === 'customers' && renderCustomers()}
             {activeTab === 'stores' && renderStores()}
             {activeTab === 'orders' && renderOrders()}
         </div>
      </main>

      {/* Modal - Glass Style */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={
         modalType === 'ADD_DRIVER' ? t.driverReg :
         modalType === 'ADD_CUSTOMER' ? t.register :
         modalType === 'ADD_STORE' ? t.storeReg :
         modalType === 'EDIT_STORE' ? t.edit :
         t.manualOrder
      } lang={lang}>
         
         {/* ... Driver, Customer, Store Forms ... */}
          {modalType === 'ADD_DRIVER' && (
           <form onSubmit={handleAddDriver} className="space-y-4">
              <div><label className={labelClass}>{t.name}</label><input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>{t.phone}</label><input required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} dir="ltr" /></div>
              <div>
                <label className={labelClass}>{t.vehicleType}</label>
                <div className="relative">
                    <select value={formData.vehicleType || 'Motor'} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className={`${inputClass} appearance-none`}>
                    <option value="Motor">{t.vehicle.motor}</option>
                    <option value="Car">{t.vehicle.car}</option>
                    <option value="Van">{t.vehicle.van}</option>
                    </select>
                    <ChevronRight className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isRTL ? 'left-4' : 'right-4'} rotate-90`} />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold mt-4 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform">{t.save}</button>
           </form>
         )}

         {modalType === 'ADD_CUSTOMER' && (
           <form onSubmit={handleAddCustomer} className="space-y-4">
              <div><label className={labelClass}>{t.name}</label><input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>{t.phone}</label><input required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} dir="ltr" /></div>
              <div><label className={labelClass}>{t.address}</label><textarea required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} rows={2} /></div>
              <div>
                  <label className={labelClass}>{t.selectMap}</label>
                  <LocationMapPicker 
                     location={formData.location || null} 
                     onLocationSelect={(lat, lng) => setFormData({...formData, location: { lat, lng }})} 
                     lang={lang} 
                  />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold mt-4 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform">{t.save}</button>
           </form>
         )}

         {(modalType === 'ADD_STORE' || modalType === 'EDIT_STORE') && (
            <form onSubmit={modalType === 'ADD_STORE' ? handleAddStore : handleEditStore} className="space-y-4">
               <div><label className={labelClass}>{t.storeName}</label><input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
               <div><label className={labelClass}>{t.owner}</label><input required value={formData.owner || ''} onChange={e => setFormData({...formData, owner: e.target.value})} className={inputClass} /></div>
               <div><label className={labelClass}>{t.phone}</label><input required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} dir="ltr" /></div>
               <div><label className={labelClass}>{t.address}</label><textarea required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} rows={2} /></div>
               <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold mt-4 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform">{t.save}</button>
            </form>
         )}

         {modalType === 'ADD_ORDER' && (
            <form onSubmit={handleCreateOrder} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t.selectCustomer}</label>
                    <div className="relative">
                        <select 
                        value={formData.customerId || ''} 
                        onChange={e => {
                            const c = customers.find(cust => cust.id === e.target.value);
                            const update = { customerId: e.target.value, storeId: undefined };
                            if(c && c.location) setMapCoords(prev => ({ ...prev, dropoff: c.location! }));
                            setFormData({...formData, ...update});
                        }} 
                        className={`${inputClass} appearance-none`} 
                        disabled={!!formData.storeId}
                        >
                        <option value="">--</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronRight className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isRTL ? 'left-4' : 'right-4'} rotate-90`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t.selectStore}</label>
                    <div className="relative">
                        <select value={formData.storeId || ''} onChange={e => setFormData({...formData, storeId: e.target.value, customerId: undefined})} className={`${inputClass} appearance-none`} disabled={!!formData.customerId}>
                        <option value="">--</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronRight className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isRTL ? 'left-4' : 'right-4'} rotate-90`} />
                    </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                       <label className={labelClass} style={{color: '#6366f1'}}>{t.pickup} (Blue)</label>
                       <div className="flex gap-2">
                           <input value={formData.pickupAddress || ''} onChange={e => setFormData({...formData, pickupAddress: e.target.value})} className={inputClass} placeholder={t.pickup} />
                           <button type="button" onClick={() => setMapPickerMode('pickup')} className={`p-3 rounded-2xl border transition-all ${mapPickerMode === 'pickup' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/50 border-white/20 hover:bg-white/80'}`}>
                               <MapPin className="w-5 h-5" />
                           </button>
                       </div>
                   </div>
                   <div>
                       <label className={labelClass} style={{color: '#ec4899'}}>{t.dropoff} (Pink)</label>
                       <div className="flex gap-2">
                           <input value={formData.dropoffAddress || ''} onChange={e => setFormData({...formData, dropoffAddress: e.target.value})} className={inputClass} placeholder={t.dropoff} />
                           <button type="button" onClick={() => setMapPickerMode('dropoff')} className={`p-3 rounded-2xl border transition-all ${mapPickerMode === 'dropoff' ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-white/50 border-white/20 hover:bg-white/80'}`}>
                               <MapPin className="w-5 h-5" />
                           </button>
                       </div>
                   </div>
               </div>

               <OrderMapPicker 
                 pickup={mapCoords.pickup}
                 dropoff={mapCoords.dropoff}
                 mode={mapPickerMode}
                 lang={lang}
                 onSetLocation={(type, lat, lng) => setMapCoords(prev => ({ ...prev, [type]: { lat, lng } }))}
               />

               <div className="grid grid-cols-2 gap-4 mt-2">
                  <div><label className={labelClass}>{t.price}</label><input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>{t.priority.NORMAL}</label>
                     <div className="relative">
                        <select value={formData.priority || 'NORMAL'} onChange={e => setFormData({...formData, priority: e.target.value})} className={`${inputClass} appearance-none`}>
                        <option value="NORMAL">{t.priority.NORMAL}</option>
                        <option value="HIGH">{t.priority.HIGH}</option>
                        <option value="URGENT">{t.priority.URGENT}</option>
                        </select>
                        <ChevronRight className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isRTL ? 'left-4' : 'right-4'} rotate-90`} />
                     </div>
                  </div>
               </div>
               <div><label className={labelClass}>Note</label><input value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className={inputClass} /></div>
               <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold mt-4 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform">{t.save}</button>
            </form>
         )}

      </Modal>
    </div>
  );
}

export default App;