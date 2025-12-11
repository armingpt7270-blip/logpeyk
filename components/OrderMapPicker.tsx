import React, { useState } from 'react';
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

export const OrderMapPicker: React.FC<OrderMapPickerProps> = ({ pickup, dropoff, mode, onSetLocation, lang }) => {
  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative z-0 mt-4">
      <MapContainer center={MAP_CENTER} zoom={12} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        
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
        {mode && (
          <div className="bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
            {lang === 'fa' 
              ? `لطفا روی نقشه کلیک کنید تا ${mode === 'pickup' ? 'مبدا (آبی)' : 'مقصد (صورتی)'} انتخاب شود`
              : `Click on map to set ${mode} location`
            }
          </div>
        )}
      </div>
    </div>
  );
};
