import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate } from 'lucide-react';
import { MAP_CENTER } from '../constants';
import { translations } from '../utils/translations';

// Define Icons
const createColorIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 2px 2px 5px rgba(0,0,0,0.3);">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24] // Tip of the pin
  });
};

const pickupIcon = createColorIcon('#3b82f6'); // Blue-500
const dropoffIcon = createColorIcon('#ec4899'); // Pink-500

interface OrderMapPickerProps {
  pickup: { lat: number; lng: number } | null;
  dropoff: { lat: number; lng: number } | null;
  mode: 'pickup' | 'dropoff' | null;
  onSetLocation: (type: 'pickup' | 'dropoff', lat: number, lng: number) => void;
  lang: 'fa' | 'en';
}

const MapEvents = ({ mode, onSetLocation }: { mode: 'pickup' | 'dropoff' | null, onSetLocation: any }) => {
  useMapEvents({
    click(e) {
      if (mode) {
        onSetLocation(mode, e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Auto locate on mount
const AutoLocate: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                map.flyTo([latitude, longitude], 14);
            });
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
       alert("Geolocation not supported");
       return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 15);
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
        className="bg-white/90 backdrop-blur text-blue-600 p-2 rounded-xl shadow-lg hover:scale-105 transition-all border border-blue-100"
        title={t.locateMe}
      >
        <Locate className="w-5 h-5" />
      </button>
    </div>
  );
};

export const OrderMapPicker: React.FC<OrderMapPickerProps> = ({ pickup, dropoff, mode, onSetLocation, lang }) => {
  
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
      // Logic handled in App.tsx
  }, [pickup, dropoff]);

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative z-0 mt-4">
      <MapContainer center={MAP_CENTER} zoom={12} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <AutoLocate />
        <LocateControl lang={lang} />
        <MapEvents mode={mode} onSetLocation={onSetLocation} />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>{lang === 'fa' ? 'مبدا' : 'Pickup'}</Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>{lang === 'fa' ? 'مقصد' : 'Dropoff'}</Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Overlay Instructions */}
      <div className="absolute top-2 right-2 left-2 z-[400] flex justify-center pointer-events-none">
        {mode ? (
          <div className={`text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-pulse font-bold
            ${mode === 'pickup' ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-pink-500 shadow-pink-500/50'}`}>
            {lang === 'fa' 
              ? `مرحله ${mode === 'pickup' ? '۱' : '۲'}: لطفا ${mode === 'pickup' ? 'مبدا (آبی)' : 'مقصد (صورتی)'} را روی نقشه انتخاب کنید`
              : `Step ${mode === 'pickup' ? '1' : '2'}: Click map to set ${mode === 'pickup' ? 'Pickup (Blue)' : 'Dropoff (Pink)'}`
            }
          </div>
        ) : (
            <div className="bg-slate-800/80 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
                {lang === 'fa' ? 'برای شروع، دکمه مبدا یا مقصد را بزنید' : 'Select Pickup or Dropoff button to start'}
            </div>
        )}
      </div>
    </div>
  );
};