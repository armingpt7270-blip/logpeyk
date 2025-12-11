import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate } from 'lucide-react';
import { Driver, Ride, DriverStatus, RideStatus } from '../types';
import { MAP_CENTER } from '../constants';
import { translations } from '../utils/translations';

// Safer Icon Initialization
const initLeafletIcons = () => {
    try {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    } catch (e) {
        console.warn("Leaflet icon init warning:", e);
    }
};

initLeafletIcons();

// Custom Icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const driverIconAvailable = createCustomIcon('#22c55e'); // Green
const driverIconBusy = createCustomIcon('#f59e0b'); // Amber
const driverIconOffline = createCustomIcon('#94a3b8'); // Gray
const ridePickupIcon = createCustomIcon('#6366f1'); // Indigo
const rideDropoffIcon = createCustomIcon('#ec4899'); // Pink

interface MapComponentProps {
  drivers: Driver[];
  rides: Ride[];
  isDarkMode?: boolean;
  lang?: 'fa' | 'en';
}

const AutoLocate: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 14, { animate: true });
        },
        (error) => {
          console.warn("Auto-locate failed", error);
        }
      );
    }
  }, [map]);

  return null;
};

const LocateControl: React.FC<{ lang: 'fa' | 'en' }> = ({ lang }) => {
  const map = useMap();
  const t = translations[lang];

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 15);
      },
      () => {
        alert(lang === 'fa' ? 'دسترسی به موقعیت مکانی امکان‌پذیر نیست' : 'Could not get your location');
      }
    );
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      <button 
        type="button"
        onClick={handleLocate}
        className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
        title={t.locateMe}
      >
        <Locate className="w-5 h-5" />
      </button>
    </div>
  );
};

export const MapComponent: React.FC<MapComponentProps> = ({ drivers, rides, isDarkMode, lang = 'fa' }) => {
  const t = translations[lang];
  const activeRides = rides.filter(r => r.status !== RideStatus.COMPLETED && r.status !== RideStatus.CANCELLED);

  // Tile Layer URLs
  const lightTiles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 relative z-0">
      <MapContainer center={MAP_CENTER} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={isDarkMode ? darkTiles : lightTiles}
        />
        
        <AutoLocate />
        <LocateControl lang={lang} />

        {/* Drivers */}
        {drivers.map(driver => (
          <Marker 
            key={driver.id} 
            position={[driver.location.lat, driver.location.lng]}
            icon={
              driver.status === DriverStatus.AVAILABLE ? driverIconAvailable :
              driver.status === DriverStatus.BUSY ? driverIconBusy : driverIconOffline
            }
          >
            <Popup className="custom-popup">
              <div className={`p-1 font-sans ${lang === 'fa' ? 'text-right' : 'text-left'}`} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                <p className="font-bold text-sm text-slate-800">{driver.name}</p>
                <p className="text-xs text-slate-500 mb-1">{driver.vehicleType} • ⭐ {driver.rating}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block
                  ${driver.status === DriverStatus.AVAILABLE ? 'bg-green-100 text-green-700' : 
                    driver.status === DriverStatus.BUSY ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                  {t.status[driver.status]}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Rides */}
        {activeRides.map(ride => (
          <React.Fragment key={ride.id}>
             {/* Pickup Marker */}
            <Marker position={[ride.pickup.lat, ride.pickup.lng]} icon={ridePickupIcon}>
               <Popup>
                <div className={`p-1 font-sans ${lang === 'fa' ? 'text-right' : 'text-left'}`} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                  <p className="font-bold text-xs text-indigo-600 mb-1">{t.pickup}</p>
                  <p className="font-medium text-sm text-slate-800">{ride.customerName}</p>
                  <p className="text-xs text-slate-500">{ride.pickup.address}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Dropoff Marker */}
            <Marker position={[ride.dropoff.lat, ride.dropoff.lng]} icon={rideDropoffIcon}>
               <Popup>
                <div className={`p-1 font-sans ${lang === 'fa' ? 'text-right' : 'text-left'}`} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                  <p className="font-bold text-xs text-pink-600 mb-1">{t.dropoff}</p>
                  <p className="font-medium text-sm text-slate-800">{ride.customerName}</p>
                  <p className="text-xs text-slate-500">{ride.dropoff.address}</p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};