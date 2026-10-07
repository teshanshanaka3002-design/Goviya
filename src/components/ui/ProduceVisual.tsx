import React from 'react';

interface ProduceVisualProps {
  type: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProduceVisual: React.FC<ProduceVisualProps> = ({
  type,
  className = '',
  size = 'md',
}) => {
  const normType = (type || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-full h-48',
  }[size];

  // Produce visual styling by crop category
  if (normType.includes('carrot')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-orange-500/30 to-amber-700/20 border border-orange-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Carrot foliage */}
          <path d="M48 32 C46 16, 38 12, 35 10 C38 18, 44 24, 48 30" stroke="#2D7A4D" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M52 30 C56 14, 62 10, 68 8 C62 18, 56 24, 52 30" stroke="#1F5C3A" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 30 C50 12, 50 8, 51 6" stroke="#48A36E" strokeWidth="3" strokeLinecap="round" />
          {/* Carrot root body */}
          <path
            d="M40 32 C42 28, 58 28, 60 32 C62 46, 56 82, 50 94 C44 82, 38 46, 40 32 Z"
            fill="url(#carrotGrad)"
          />
          {/* Texture ridges */}
          <path d="M43 45 Q50 47 57 44" stroke="#D95700" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M44 58 Q50 60 56 57" stroke="#D95700" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M46 72 Q50 74 54 71" stroke="#D95700" strokeWidth="1.8" strokeLinecap="round" />
          <defs>
            <linearGradient id="carrotGrad" x1="40" y1="30" x2="60" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF7A00" />
              <stop offset="0.6" stopColor="#E65100" />
              <stop offset="1" stopColor="#BF360C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('onion') || normType.includes('shallot')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500/20 via-purple-500/30 to-rose-900/20 border border-rose-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Roots */}
          <path d="M48 88 L45 95 M50 88 L50 96 M52 88 L55 94" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
          {/* Bulb */}
          <path
            d="M50 18 C30 26, 22 50, 26 68 C30 84, 44 88, 50 88 C56 88, 70 84, 74 68 C78 50, 70 26, 50 18 Z"
            fill="url(#onionGrad)"
          />
          {/* Bulb layers / stripes */}
          <path d="M42 24 C32 40, 32 64, 42 82" stroke="#6A1B4D" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          <path d="M58 24 C68 40, 68 64, 58 82" stroke="#6A1B4D" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          <path d="M50 18 L50 88" stroke="#6A1B4D" strokeWidth="1.5" opacity="0.4" />
          <path d="M50 18 L50 12" stroke="#8E2463" strokeWidth="3" strokeLinecap="round" />
          <defs>
            <linearGradient id="onionGrad" x1="25" y1="20" x2="75" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A22A5E" />
              <stop offset="0.6" stopColor="#811746" />
              <stop offset="1" stopColor="#4E0D2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('chill') || normType.includes('miris')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-green-500/30 to-teal-900/20 border border-emerald-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem */}
          <path d="M58 12 C52 18, 52 24, 52 28" stroke="#16452B" strokeWidth="4" strokeLinecap="round" />
          {/* Calyx cap */}
          <path d="M42 28 C48 24, 56 24, 62 28 C58 32, 46 32, 42 28 Z" fill="#2D7A4D" />
          {/* Chili pepper body curved */}
          <path
            d="M44 28 C48 28, 60 28, 60 38 C60 52, 54 70, 44 86 C40 88, 38 84, 40 80 C46 66, 50 50, 48 38 C47 34, 45 32, 44 28 Z"
            fill="url(#chiliGrad)"
          />
          {/* Chili shine curve */}
          <path d="M52 38 C54 48, 50 62, 44 76" stroke="#9AE6B4" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          <defs>
            <linearGradient id="chiliGrad" x1="42" y1="28" x2="60" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38A169" />
              <stop offset="0.7" stopColor="#22543D" />
              <stop offset="1" stopColor="#1C4532" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('leek')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-900/20 border border-green-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White stalk */}
          <rect x="42" y="55" width="16" height="36" rx="4" fill="#F0FFF4" />
          {/* Root hairs */}
          <path d="M46 91 L44 96 M50 91 L50 97 M54 91 L56 96" stroke="#CBD5E0" strokeWidth="1.5" strokeLinecap="round" />
          {/* Mid green sheath */}
          <rect x="40" y="38" width="20" height="22" rx="3" fill="#68D391" />
          {/* Deep green fan blades */}
          <path d="M42 40 L30 14 C36 12, 44 22, 46 38 Z" fill="#22543D" />
          <path d="M50 40 L50 10 C54 14, 52 24, 52 38 Z" fill="#276749" />
          <path d="M58 40 L70 14 C64 12, 56 22, 54 38 Z" fill="#1C4532" />
        </svg>
      </div>
    );
  }

  if (normType.includes('tomato') || normType.includes('thakkali')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500/20 via-rose-500/30 to-amber-900/20 border border-red-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tomato fruit */}
          <circle cx="50" cy="56" r="32" fill="url(#tomatoGrad)" />
          {/* Stem & sepals */}
          <path d="M50 24 L50 16" stroke="#22543D" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 24 L42 20 M50 24 L58 20 M50 24 L44 28 M50 24 L56 28 M50 24 L50 30" stroke="#2F855A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Gloss highlight */}
          <ellipse cx="40" cy="45" rx="7" ry="4" transform="rotate(-30 40 45)" fill="white" opacity="0.45" />
          <defs>
            <linearGradient id="tomatoGrad" x1="30" y1="30" x2="70" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F56565" />
              <stop offset="0.6" stopColor="#E53E3E" />
              <stop offset="1" stopColor="#9B2C2C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('papaya') || normType.includes('fruit')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400/20 via-orange-400/30 to-emerald-900/20 border border-amber-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Papaya pear shape */}
          <path
            d="M50 18 C38 18, 36 34, 30 52 C24 70, 32 86, 50 86 C68 86, 76 70, 70 52 C64 34, 62 18, 50 18 Z"
            fill="url(#papayaGrad)"
          />
          {/* Green-yellow speckle pattern */}
          <path d="M50 18 L50 12" stroke="#22543D" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="42" cy="52" rx="4" ry="12" fill="#E28743" opacity="0.6" />
          <defs>
            <linearGradient id="papayaGrad" x1="35" y1="20" x2="65" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F6AD55" />
              <stop offset="0.4" stopColor="#ED8936" />
              <stop offset="0.8" stopColor="#DD6B20" />
              <stop offset="1" stopColor="#2F855A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('brinjal') || normType.includes('wambatu') || normType.includes('eggplant')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600/25 via-indigo-600/25 to-purple-950/30 border border-purple-200/50 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem & Calyx */}
          <path d="M50 14 C48 18, 50 24, 50 28" stroke="#16452B" strokeWidth="4" strokeLinecap="round" />
          <path d="M38 28 C42 34, 48 30, 50 28 C52 30, 58 34, 62 28 C64 36, 56 38, 50 36 C44 38, 36 36, 38 28 Z" fill="#2D7A4D" />
          {/* Brinjal teardrop body */}
          <path
            d="M50 30 C38 32, 28 50, 30 70 C32 86, 44 92, 50 92 C56 92, 68 86, 70 70 C72 50, 62 32, 50 30 Z"
            fill="url(#brinjalGrad)"
          />
          {/* Gloss highlight */}
          <ellipse cx="42" cy="56" rx="6" ry="16" transform="rotate(-15 42 56)" fill="white" opacity="0.35" />
          <defs>
            <linearGradient id="brinjalGrad" x1="30" y1="30" x2="70" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6B21A8" />
              <stop offset="0.6" stopColor="#4C1D95" />
              <stop offset="1" stopColor="#2E1065" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('okra') || normType.includes('bandakka') || normType.includes('ladies')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-lime-500/20 via-emerald-500/25 to-teal-900/20 border border-lime-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem */}
          <path d="M50 12 L50 22" stroke="#16452B" strokeWidth="4" strokeLinecap="round" />
          <path d="M42 22 L58 22 L55 26 L45 26 Z" fill="#2D7A4D" />
          {/* Okra 5-ridge pod */}
          <path
            d="M44 26 L56 26 L53 82 L50 92 L47 82 Z"
            fill="url(#okraGrad)"
          />
          {/* Ridges */}
          <path d="M50 26 L50 92" stroke="#1E5E38" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M47 26 L48 82" stroke="#A7F3D0" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <defs>
            <linearGradient id="okraGrad" x1="44" y1="26" x2="56" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#48BB78" />
              <stop offset="0.6" stopColor="#2F855A" />
              <stop offset="1" stopColor="#1C4532" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('gourd') || normType.includes('pathola') || normType.includes('karawila')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400/20 via-teal-500/25 to-green-950/20 border border-emerald-200/40 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M46 14 C48 18, 50 20, 50 24" stroke="#16452B" strokeWidth="3" strokeLinecap="round" />
          {/* Long curved snake gourd */}
          <path
            d="M48 24 C52 24, 56 36, 54 50 C52 66, 44 76, 46 88 C47 92, 51 92, 52 88 C54 74, 62 60, 60 46 C58 32, 54 24, 48 24 Z"
            fill="url(#gourdGrad)"
          />
          {/* White stripes on green */}
          <path d="M51 28 Q55 46 51 68" stroke="#D1FAE5" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M47 38 Q50 56 46 76" stroke="#D1FAE5" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <defs>
            <linearGradient id="gourdGrad" x1="45" y1="24" x2="60" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.6" stopColor="#059669" />
              <stop offset="1" stopColor="#065F46" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normType.includes('mukunuwenna') || normType.includes('gotukola') || normType.includes('leaf') || normType.includes('green')) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/25 via-emerald-600/30 to-teal-900/25 border border-emerald-200/50 ${sizeClasses} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Leaves cluster */}
          <circle cx="50" cy="50" r="30" fill="url(#greensGrad)" />
          <path d="M50 82 L50 40" stroke="#16452B" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 58 Q40 50 32 52" stroke="#16452B" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 48 Q60 42 68 44" stroke="#16452B" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 34 C30 40, 32 56, 44 54 C54 52, 50 32, 38 34 Z" fill="#4ADE80" opacity="0.85" />
          <path d="M62 34 C70 40, 68 56, 56 54 C46 52, 50 32, 62 34 Z" fill="#22C55E" opacity="0.85" />
          <defs>
            <linearGradient id="greensGrad" x1="30" y1="30" x2="70" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#86EFAC" />
              <stop offset="0.5" stopColor="#22C55E" />
              <stop offset="1" stopColor="#15803D" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Default organic vegetable icon
  return (
    <div
      className={`relative overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-green-600/20 to-teal-800/20 border border-emerald-200/40 ${sizeClasses} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-3/5 h-3/5 text-emerald-800 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 20 C32 20, 24 38, 24 56 C24 74, 36 84, 50 84 C64 84, 76 74, 76 56 C76 38, 68 20, 50 20 Z"
          fill="#38A169"
        />
        <path d="M50 20 L50 84" stroke="#22543D" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 38 Q38 48 30 52" stroke="#22543D" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 50 Q62 60 70 64" stroke="#22543D" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
