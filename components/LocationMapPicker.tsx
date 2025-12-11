import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate } from 'lucide-react';
import { MAP_CENTER } from '../constants';
import { translations } from '../utils/translations';

// Define Generic Pin Icon (Red)
const pinIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 2px 2px 5px rgba(0,0,0,0.3);">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24]
});

interface LocationMapPickerProps {
  location: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
  lang: 'fa' | 'en';
}

const MapEvents = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
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

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({ location, onLocationSelect, lang }) => {
  return (
    <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative z-0 mt-2">
      <MapContainer center={MAP_CENTER} zoom={12} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <AutoLocate />
        <LocateControl lang={lang} />
        <MapEvents onLocationSelect={onLocationSelect} />

        {location && (
          <Marker position={[location.lat, location.lng]} icon={pinIcon}>
            <Popup>{lang === 'fa' ? 'موقعیت انتخابی' : 'Selected Location'}</Popup>
          </Marker>
        )}
      </MapContainer>
      
      {!location && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-900/10 z-[400]">
           <span className="text-xs bg-white/90 px-2 py-1.5 rounded shadow text-slate-600 font-bold">
             {lang === 'fa' ? 'برای انتخاب موقعیت روی نقشه کلیک کنید' : 'Click on map to select location'}
           </span>
        </div>
      )}
    </div>
  );
};