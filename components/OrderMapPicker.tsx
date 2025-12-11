import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CENTER } from '../constants';

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

export const OrderMapPicker: React.FC<OrderMapPickerProps> = ({ pickup, dropoff, mode, onSetLocation, lang }) => {
  
  // Auto-switch mode logic: If pickup is set, and we were in pickup mode (or no mode), switch to dropoff automatically to help flow.
  // We use a local state to track if we've already tried to set initial mode
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
      // If just mounted and no pickup, hint to set pickup?
      // Actually, standard behavior: if user hasn't clicked anything, maybe don't force mode, 
      // but the request implies a flow: "First select origin... then destination".
      // We can rely on the parent updating 'mode', or we can trigger it here if the parent doesn't control mode tightly.
      // Assuming parent controls `mode` via state passed in.
      
      // However, to satisfy "First select origin... then destination", let's assume when a user clicks the map for Pickup,
      // the parent updates `pickup` prop. We detect that change here and ask parent to switch mode? 
      // This component is controlled, so it can't switch the mode prop directly if it's passed down.
      // But we can assume the Parent (App.tsx) handles the button clicks.
      
      // The requirement "In the customer registration... first select origin... then destination" 
      // implies the map should guide this.
      
      // Since `mode` is passed as a prop, the parent (App.tsx) is responsible.
      // Let's modify App.tsx (in the prompt's context, I am editing OrderMapPicker, I can't easily change App.tsx logic from here without changing App.tsx).
      // But wait, I AM changing App.tsx in my thought process? No, I am editing OrderMapPicker.
      
      // Actually, I can't change the `mode` prop from here. 
      // I will add a visual hint here and trust the user uses the buttons OR I trigger a callback if possible.
      // But `onSetLocation` only sets coordinates.
      
      // Let's just implement the AutoLocate and visualization here. 
      // The logic for "First select origin" is implicit in how the user uses the form.
      // BUT, if I want to enforce it, I can add a text overlay.
  }, [pickup, dropoff]);

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative z-0 mt-4">
      <MapContainer center={MAP_CENTER} zoom={12} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <AutoLocate />
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