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
  PlusCircle
} from 'lucide-react';

import { Ride, Driver, RideStatus, DriverStatus, Customer, Store } from './types';
import { db } from './services/database'; // Import Database
import { StatCard } from './components/StatCard';
// MapComponent removed from dashboard usage but kept if needed elsewhere, 
// though we use OrderMapPicker for selection now.
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
  
  // Data State - Loaded from "Database"
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ADD_DRIVER' | 'ADD_CUSTOMER' | 'ADD_STORE' | 'EDIT_STORE' | 'ADD_ORDER' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState<any>({});
  
  // Map Picker State for Order Modal
  const [mapPickerMode, setMapPickerMode] = useState<'pickup' | 'dropoff' | null>(null);
  const [mapCoords, setMapCoords] = useState<{ pickup: {lat: number, lng: number} | null, dropoff: {lat: number, lng: number} | null }>({ pickup: null, dropoff: null });

  const t = translations[lang];
  const isRTL = lang === 'fa';

  // Load Data on Mount
  useEffect(() => {
    setDrivers(db.getDrivers());
    setRides(db.getRides());
    setCustomers(db.getCustomers());
    setStores(db.getStores());

    // Check for "Remember Me" session
    const savedAuth = db.getCredentials();
    if (savedAuth) {
        // Optional: Add expiry check here
        setIsAuthenticated(true);
        setUserRole(savedAuth.role as any);
    }
  }, []);

  // Save Data on Change
  useEffect(() => { if(drivers.length) db.saveDrivers(drivers); }, [drivers]);
  useEffect(() => { if(rides.length) db.saveRides(rides); }, [rides]);
  useEffect(() => { if(customers.length) db.saveCustomers(customers); }, [customers]);
  useEffect(() => { if(stores.length) db.saveStores(stores); }, [stores]);

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

  // --- Actions ---

  const handleLogin = (role: 'ADMIN' | 'DRIVER' | 'STORE') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('ADMIN');
    db.clearCredentials(); // Clear "Remember Me"
  };

  // Drivers Management
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
    if (confirm(t.delete + '?')) {
      setDrivers(drivers.filter(d => d.id !== id));
    }
  };

  const handleToggleDriverStatus = (id: string) => {
    setDrivers(drivers.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: d.status === DriverStatus.OFFLINE ? DriverStatus.AVAILABLE : DriverStatus.OFFLINE
        };
      }
      return d;
    }));
  };

  // Customers Management
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      location: formData.location // Save map location
    };
    setCustomers([...customers, newCustomer]);
    closeModal();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm(t.delete + '?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  // Stores Management
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
    if (confirm(t.delete + '?')) {
      setStores(stores.filter(s => s.id !== id));
    }
  };

  // Orders Management
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    const store = stores.find(s => s.id === formData.storeId);
    
    // Default coords: Use Map Picker > Customer Stored Location > Default Tehran
    const pickupCoords = mapCoords.pickup || { lat: 35.6892, lng: 51.3890 };
    
    // For dropoff, if map isn't picked, try to use customer's stored location
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

  // Modal Helpers
  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    // Reset map picker for orders
    setMapCoords({ pickup: null, dropoff: null });
    setMapPickerMode(null);
    
    // Auto-fill map coords if creating order from customer/store with known location
    if (type === 'ADD_ORDER') {
       if (item?.customerId) {
           const c = customers.find(cust => cust.id === item.customerId);
           if (c && c.location) {
               setMapCoords(prev => ({ ...prev, dropoff: c.location! }));
           }
       }
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedItem(null);
    setFormData({});
  };

  // View Components

  const renderDashboard = () => (
    <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Top Section: AI Input */}
        <div className="mb-6 w-full max-w-4xl mx-auto">
             <AIChatInput onRideCreate={handleAICreateRide} lang={lang} />
        </div>

        {/* Full Width Order List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
             <div className="flex items-center gap-3">
                 <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                     <Package className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t.activeRides}</h3>
                    <p className="text-xs text-slate-500">{t.pendingRides}: {rides.filter(r => r.status === RideStatus.PENDING).length}</p>
                 </div>
             </div>
             <button onClick={() => openModal('ADD_ORDER')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                <Plus className="w-4 h-4" /> {t.add}
             </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t.drivers}</h3>
        <button onClick={() => openModal('ADD_DRIVER')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> {t.add}
        </button>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {drivers.map(d => (
           <div key={d.id} className="relative bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <img src={d.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-white">{d.name}</h4>
                <p className="text-xs text-slate-500">{d.phone} • {d.vehicleType}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : d.status === 'BUSY' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                    {t.status[d.status]}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                 <button onClick={() => handleToggleDriverStatus(d.id)} title={t.toggleStatus} className={`p-2 rounded-lg ${d.status === DriverStatus.OFFLINE ? 'bg-slate-200 text-slate-500 hover:bg-green-100 hover:text-green-600' : 'bg-green-100 text-green-600 hover:bg-slate-200 hover:text-slate-500'}`}>
                    <Power className="w-4 h-4" />
                 </button>
                 <button onClick={() => handleDeleteDriver(d.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
         {drivers.length === 0 && <div className="col-span-full text-center py-10 text-slate-400">{t.allDrivers} {t.unknown}</div>}
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t.customers}</h3>
        <button onClick={() => openModal('ADD_CUSTOMER')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> {t.add}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500">
            <tr>
              <th className="p-4 font-bold">{t.name}</th>
              <th className="p-4 font-bold">{t.phone}</th>
              <th className="p-4 font-bold">{t.address}</th>
              <th className="p-4 font-bold w-28">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{c.phone}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">{c.address}</td>
                <td className="p-4 flex gap-2 justify-end">
                   <button onClick={() => openModal('ADD_ORDER', { customerId: c.id, dropoffAddress: c.address })} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors" title={t.createOrder}>
                      <PlusCircle className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDeleteCustomer(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">{t.unknown}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStores = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t.stores}</h3>
        <button onClick={() => openModal('ADD_STORE')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> {t.add}
        </button>
      </div>
       <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {stores.map(s => (
           <div key={s.id} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors group relative">
              <div className="flex justify-between items-start mb-2">
                 <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                    <StoreIcon className="w-5 h-5" />
                 </div>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal('EDIT_STORE', s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteStore(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                 </div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{s.name}</h4>
              <p className="text-xs text-slate-500 mb-2">{t.owner}: {s.owner}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1"><Users className="w-3 h-3" /> {s.phone}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1"><Car className="w-3 h-3 inline" /> {s.address}</p>
              <button onClick={() => openModal('ADD_ORDER', { storeId: s.id, pickupAddress: s.address })} className="mt-4 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                 {t.manualOrder}
              </button>
           </div>
         ))}
         {stores.length === 0 && <div className="col-span-full text-center py-10 text-slate-400">{t.unknown}</div>}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col">
       <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t.orders}</h3>
          <button onClick={() => openModal('ADD_ORDER')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> {t.add}
          </button>
       </div>
       <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
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

  // Authentication Check
  if (!isAuthenticated) {
    return (
      <>
        <div className={`fixed top-4 z-50 flex gap-2 ${isRTL ? 'left-4' : 'right-4'}`}>
             <button onClick={() => setLang(prev => prev === 'fa' ? 'en' : 'fa')} className="w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all text-[10px] font-bold">{lang === 'fa' ? 'EN' : 'FA'}</button>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all">{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
        </div>
        <Auth onLogin={handleLogin} lang={lang} />
      </>
    );
  }

  // Common Input Class
  const inputClass = "w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white";
  const labelClass = "block text-xs font-bold text-slate-500 mb-1.5";

  return (
    <div className={`flex h-screen bg-[#f8fafc] dark:bg-[#0b1120] font-sans transition-colors duration-300`}>
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex z-10 shadow-sm">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-slate-900 dark:bg-white p-1.5 rounded-lg ml-3">
              <Car className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white hidden lg:block tracking-tight">{t.appTitle}</span>
          </div>
          
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
              { id: 'orders', icon: Package, label: t.orders },
              { id: 'drivers', icon: Car, label: t.drivers },
              { id: 'customers', icon: Users, label: t.customers },
              { id: 'stores', icon: StoreIcon, label: t.stores },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <item.icon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <span className="font-medium text-sm hidden lg:block">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
           <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <LogOut className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <span className="font-medium text-sm hidden lg:block">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-1.5 ${isRTL ? 'border-l pl-4' : 'border-r pr-4'} border-slate-200 dark:border-slate-800`}>
                <button onClick={() => setLang(prev => prev === 'fa' ? 'en' : 'fa')} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[10px] font-bold">{lang === 'fa' ? 'EN' : 'FA'}</button>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
             </div>
             <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
               {activeTab === 'dashboard' ? t.dashboard : activeTab === 'drivers' ? t.drivers : activeTab === 'customers' ? t.customers : activeTab === 'stores' ? t.stores : t.orders}
             </h1>
          </div>
          <div className={`flex items-center gap-3 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
               {userRole === 'ADMIN' ? 'AD' : 'US'}
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 md:pb-6 z-10 relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'drivers' && renderDrivers()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'stores' && renderStores()}
          {activeTab === 'orders' && renderOrders()}
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={
         modalType === 'ADD_DRIVER' ? t.driverReg :
         modalType === 'ADD_CUSTOMER' ? t.register :
         modalType === 'ADD_STORE' ? t.storeReg :
         modalType === 'EDIT_STORE' ? t.edit :
         t.manualOrder
      } lang={lang}>
         
         {/* ... Driver, Customer, Store Forms remain same ... */}

         {modalType === 'ADD_DRIVER' && (
           <form onSubmit={handleAddDriver} className="space-y-4">
              <div><label className={labelClass}>{t.name}</label><input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>{t.phone}</label><input required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} dir="ltr" /></div>
              <div>
                <label className={labelClass}>{t.vehicleType}</label>
                <select value={formData.vehicleType || 'Motor'} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className={inputClass}>
                  <option value="Motor">{t.vehicle.motor}</option>
                  <option value="Car">{t.vehicle.car}</option>
                  <option value="Van">{t.vehicle.van}</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold mt-4">{t.save}</button>
           </form>
         )}

         {modalType === 'ADD_CUSTOMER' && (
           <form onSubmit={handleAddCustomer} className="space-y-4">
              <div><label className={labelClass}>{t.name}</label><input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>{t.phone}</label><input required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} dir="ltr" /></div>
              <div><label className={labelClass}>{t.address}</label><textarea required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} rows={2} /></div>
              
              {/* Location Picker for Customer */}
              <div>
                  <label className={labelClass}>{t.selectMap}</label>
                  <LocationMapPicker 
                     location={formData.location || null} 
                     onLocationSelect={(lat, lng) => setFormData({...formData, location: { lat, lng }})} 
                     lang={lang} 
                  />
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold mt-4">{t.save}</button>
           </form>
         )}

         {(modalType === 'ADD_STORE' || modalType === 'EDIT_STORE') && (
            <form onSubmit={modalType === 'ADD_STORE' ? handleAddStore : handleEditStore} className="space-y-4">
               <div><label className={labelClass}>{t.storeName}</label><input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
               <div><label className={labelClass}>{t.owner}</label><input required value={formData.owner || ''} onChange={e => setFormData({...formData, owner: e.target.value})} className={inputClass} /></div>
               <div><label className={labelClass}>{t.phone}</label><input required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} dir="ltr" /></div>
               <div><label className={labelClass}>{t.address}</label><textarea required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} rows={2} /></div>
               <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold mt-4">{t.save}</button>
            </form>
         )}

         {modalType === 'ADD_ORDER' && (
            <form onSubmit={handleCreateOrder} className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{t.selectCustomer}</label>
                    <select 
                      value={formData.customerId || ''} 
                      onChange={e => {
                         const c = customers.find(cust => cust.id === e.target.value);
                         const update = { customerId: e.target.value, storeId: undefined };
                         if(c && c.location) {
                             // Auto-set dropoff on map
                             setMapCoords(prev => ({ ...prev, dropoff: c.location! }));
                         }
                         setFormData({...formData, ...update});
                      }} 
                      className={inputClass} 
                      disabled={!!formData.storeId}
                    >
                      <option value="">--</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t.selectStore}</label>
                    <select value={formData.storeId || ''} onChange={e => setFormData({...formData, storeId: e.target.value, customerId: undefined})} className={inputClass} disabled={!!formData.customerId}>
                      <option value="">--</option>
                      {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
               </div>
               
               {/* Location Inputs */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div>
                       <label className={labelClass} style={{color: '#3b82f6'}}>{t.pickup} (آبی)</label>
                       <div className="flex gap-2">
                           <input value={formData.pickupAddress || ''} onChange={e => setFormData({...formData, pickupAddress: e.target.value})} className={inputClass} placeholder={t.pickup} />
                           <button type="button" onClick={() => setMapPickerMode('pickup')} className={`p-2 rounded-lg border transition-colors ${mapPickerMode === 'pickup' ? 'bg-blue-100 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                               <MapPin className="w-5 h-5" />
                           </button>
                       </div>
                   </div>
                   <div>
                       <label className={labelClass} style={{color: '#ec4899'}}>{t.dropoff} (صورتی)</label>
                       <div className="flex gap-2">
                           <input value={formData.dropoffAddress || ''} onChange={e => setFormData({...formData, dropoffAddress: e.target.value})} className={inputClass} placeholder={t.dropoff} />
                           <button type="button" onClick={() => setMapPickerMode('dropoff')} className={`p-2 rounded-lg border transition-colors ${mapPickerMode === 'dropoff' ? 'bg-pink-100 border-pink-500 text-pink-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                               <MapPin className="w-5 h-5" />
                           </button>
                       </div>
                   </div>
               </div>

               {/* Map Picker */}
               <OrderMapPicker 
                 pickup={mapCoords.pickup}
                 dropoff={mapCoords.dropoff}
                 mode={mapPickerMode}
                 lang={lang}
                 onSetLocation={(type, lat, lng) => {
                     setMapCoords(prev => ({ ...prev, [type]: { lat, lng } }));
                     // Optionally reverse geocode here if you had an API
                 }}
               />

               <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className={labelClass}>{t.price}</label><input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>{t.priority.NORMAL}</label>
                    <select value={formData.priority || 'NORMAL'} onChange={e => setFormData({...formData, priority: e.target.value})} className={inputClass}>
                      <option value="NORMAL">{t.priority.NORMAL}</option>
                      <option value="HIGH">{t.priority.HIGH}</option>
                      <option value="URGENT">{t.priority.URGENT}</option>
                    </select>
                  </div>
               </div>
               <div><label className={labelClass}>Note</label><input value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className={inputClass} /></div>
               <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold mt-4">{t.save}</button>
            </form>
         )}

      </Modal>
    </div>
  );
}

export default App;