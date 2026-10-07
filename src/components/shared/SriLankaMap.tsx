import React from 'react';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';
import { Listing } from '../../types';

export interface SriLankaMapProps {
  markers?: {
    id: string;
    name: string;
    crop?: string;
    district: string;
    town: string;
    lat: number;
    lng: number;
    type?: 'farmer' | 'buyer' | 'driver';
  }[];
  selectedId?: string | null;
  onSelectMarker?: (id: string) => void;
  showRoute?: boolean;
  routeTitle?: string;
  className?: string;
}

export const SriLankaMap: React.FC<SriLankaMapProps> = ({
  markers = [],
  selectedId,
  onSelectMarker,
  showRoute = false,
  routeTitle,
  className = '',
}) => {
  // Center roughly on central Sri Lanka: Lat 7.8, Lng 80.7
  // Bounding box: Lat 5.9 to 9.8 (height ~3.9), Lng 79.5 to 81.9 (width ~2.4)
  const projectCoordinates = (lat: number, lng: number) => {
    // Map to SVG coordinates 0-100%
    const minLat = 5.8;
    const maxLat = 9.9;
    const minLng = 79.5;
    const maxLng = 81.9;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
  };

  return (
    <div
      className={`relative w-full h-64 bg-[#EAF4ED] rounded-2xl overflow-hidden border border-[#D5EAD8] shadow-inner ${className}`}
    >
      {/* Background Topographic Water & Island Geometry */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full object-cover"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="islandLandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DFEFE3" />
            <stop offset="50%" stopColor="#D5EAD8" />
            <stop offset="100%" stopColor="#CBE4CE" />
          </linearGradient>
          <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#D1E8D5" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="100" height="100" fill="#EAF4ED" />
        <rect width="100" height="100" fill="url(#gridPattern)" />

        {/* Approximate Stylized Sri Lanka Teardrop Island Silhouette */}
        <path
          d="M 38 12 
             C 45 8, 52 14, 54 22 
             C 58 32, 68 45, 72 58 
             C 74 70, 70 82, 58 92 
             C 48 94, 38 90, 32 82 
             C 24 72, 22 55, 25 40 
             C 28 28, 30 18, 38 12 Z"
          fill="url(#islandLandGrad)"
          stroke="#B8DEC0"
          strokeWidth="0.8"
        />

        {/* Major Transport Corridors (A1, A7, A9) */}
        <path
          d="M 30 70 Q 42 55 50 45 T 46 20"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeDasharray="2,1"
          opacity="0.8"
        />
        <path
          d="M 30 70 Q 40 72 50 62"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          opacity="0.8"
        />

        {/* Dynamic Route Line if requested */}
        {showRoute && (
          <path
            d="M 52 64 C 48 66, 38 68, 30 70"
            fill="none"
            stroke="#1F5C3A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4,2"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Compass Badge */}
      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-xl shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-[#1F5C3A]">
        <Compass className="w-3.5 h-3.5" />
        <span>Sri Lanka Agri GPS</span>
      </div>

      {routeTitle && (
        <div className="absolute top-2.5 left-2.5 bg-[#1F5C3A] text-white px-2.5 py-1 rounded-xl shadow-xs text-[10px] font-semibold flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          <span>{routeTitle}</span>
        </div>
      )}

      {/* Markers */}
      {markers.map((m, idx) => {
        const { x, y } = projectCoordinates(m.lat, m.lng);
        const isSelected = selectedId === m.id;

        return (
          <button
            key={`${m.id}-${idx}`}
            type="button"
            onClick={() => onSelectMarker?.(m.id)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
              isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
            }`}
            title={`${m.name} (${m.town})`}
          >
            <div className="relative flex flex-col items-center">
              {/* Pin Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors ${
                  m.type === 'driver'
                    ? 'bg-[#5BB5C9] text-white'
                    : m.type === 'buyer'
                    ? 'bg-[#C8452D] text-white'
                    : isSelected
                    ? 'bg-[#1F5C3A] text-white ring-2 ring-[#1F5C3A]/40'
                    : 'bg-[#1F5C3A] text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
              </div>

              {/* Tag Label */}
              <div
                className={`mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-xs whitespace-nowrap pointer-events-none ${
                  isSelected
                    ? 'bg-[#1F5C3A] text-white'
                    : 'bg-white/95 text-[#1A1A1A] border border-black/10'
                }`}
              >
                {m.town}
              </div>
            </div>
          </button>
        );
      })}

      {/* Bottom Map Controls hint */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-[#2D6A4F] bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg">
        <span className="font-semibold flex items-center gap-1">
          <Layers className="w-3 h-3" />
          Direct Farm Gate Hubs
        </span>
        <span>Tap any marker to explore</span>
      </div>
    </div>
  );
};
