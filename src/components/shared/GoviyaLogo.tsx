import React from 'react';
import { View, Text } from 'react-native';
import Svg, {
  G,
  Rect,
  Path,
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

interface GoviyaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  variant?: 'color' | 'white' | 'dark';
  withText?: boolean;
  textColor?: string;
  subtextColor?: string;
  tagline?: string;
  className?: string;
}

export const GoviyaLogo: React.FC<GoviyaLogoProps> = ({
  size = 'md',
  variant = 'color',
  withText = false,
  textColor,
  subtextColor,
  tagline,
  className = '',
}) => {
  let dimension = 36;
  if (typeof size === 'number') {
    dimension = size;
  } else {
    switch (size) {
      case 'xs':
        dimension = 24;
        break;
      case 'sm':
        dimension = 32;
        break;
      case 'md':
        dimension = 40;
        break;
      case 'lg':
        dimension = 52;
        break;
      case 'xl':
        dimension = 68;
        break;
      case '2xl':
        dimension = 84;
        break;
    }
  }

  const isWhite = variant === 'white';

  return (
    <View className={`flex-row items-center gap-2.5 ${className}`}>
      <Svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
      >
        <Defs>
          <LinearGradient id="goviyaBgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#1B4D30" />
            <Stop offset="50%" stopColor="#1F5C3A" />
            <Stop offset="100%" stopColor="#143D26" />
          </LinearGradient>

          <LinearGradient id="leafGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#4ADE80" />
            <Stop offset="60%" stopColor="#22C55E" />
            <Stop offset="100%" stopColor="#16A34A" />
          </LinearGradient>

          <LinearGradient id="goldPaddyGrad" x1="30" y1="10" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="40%" stopColor="#EAB308" />
            <Stop offset="100%" stopColor="#CA8A04" />
          </LinearGradient>

          <RadialGradient id="sunGlow" cx="62" cy="38" r="24" fx="62" fy="38" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
          </RadialGradient>
        </Defs>

        {isWhite ? (
          <G>
            <Rect width="100" height="100" rx="26" fill="#FFFFFF" />
            <Circle cx="60" cy="36" r="16" fill="#FEF3C7" />
            <Path
              d="M16 80 C 35 72, 65 72, 84 80"
              stroke="#D97706"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <Path
              d="M22 86 C 40 80, 60 80, 78 86"
              stroke="#E5E7EB"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <Path
              d="M50 74 C 50 56, 68 40, 78 30"
              stroke="url(#goldPaddyGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Path
              d="M60 48 Q 72 44, 76 34"
              stroke="url(#goldPaddyGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <Path
              d="M68 60 Q 80 56, 82 46"
              stroke="url(#goldPaddyGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <Path
              d="M50 74 C 48 50, 32 36, 20 34 C 20 54, 38 68, 50 74 Z"
              fill="url(#leafGrad)"
            />
            <Path
              d="M50 74 C 50 44, 42 22, 40 18 C 54 26, 56 48, 50 74 Z"
              fill="#15803D"
            />
            <Circle cx="50" cy="74" r="4.5" fill="#1F5C3A" />
          </G>
        ) : (
          <G>
            <Rect width="100" height="100" rx="26" fill="url(#goviyaBgGrad)" />
            <Rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="24"
              stroke="#34D399"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              fill="none"
            />
            <Circle cx="64" cy="36" r="16" fill="url(#sunGlow)" />
            <Circle cx="64" cy="36" r="11" fill="#FBBF24" fillOpacity="0.95" />
            <Path
              d="M16 80 C 35 73, 65 73, 84 80"
              stroke="#F59E0B"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
            <Path
              d="M24 87 C 40 82, 60 82, 76 87"
              stroke="#A7F3D0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />
            <Path
              d="M50 76 C 52 58, 68 42, 78 30"
              stroke="url(#goldPaddyGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Ellipse cx="64" cy="44" rx="4.2" ry="2.6" transform="rotate(-30 64 44)" fill="#FDE047" />
            <Ellipse cx="73" cy="38" rx="4.2" ry="2.6" transform="rotate(-40 73 38)" fill="#FDE047" />
            <Ellipse cx="79" cy="28" rx="3.8" ry="2.4" transform="rotate(-55 79 28)" fill="#FEF08A" />
            <Ellipse cx="70" cy="54" rx="4.2" ry="2.6" transform="rotate(-25 70 54)" fill="#EAB308" />
            <Path
              d="M50 76 C 48 50, 30 36, 18 34 C 18 54, 38 70, 50 76 Z"
              fill="url(#leafGrad)"
            />
            <Path
              d="M50 76 C 50 44, 42 22, 40 18 C 54 26, 56 50, 50 76 Z"
              fill="#86EFAC"
            />
            <Circle cx="50" cy="76" r="4.5" fill="#FEF08A" />
          </G>
        )}
      </Svg>

      {withText && (
        <View className="flex-col justify-center">
          <View className="flex-row items-baseline gap-1.5">
            <Text
              className={`text-lg font-black tracking-tight ${
                textColor || (isWhite ? 'text-white' : 'text-[#1A1A1A]')
              }`}
            >
              Goviya
            </Text>
            <View className="bg-[#ECFDF5] px-1.5 py-0.5 rounded-md">
              <Text className="text-[10px] font-bold text-[#10B981]">LK</Text>
            </View>
          </View>
          {tagline ? (
            <Text
              className={`text-[10px] font-semibold tracking-wide ${
                subtextColor || (isWhite ? 'text-white/80' : 'text-[#6B7280]')
              }`}
            >
              {tagline}
            </Text>
          ) : (
            <Text
              className={`text-[10px] font-medium ${
                subtextColor || (isWhite ? 'text-white/70' : 'text-[#6B7280]')
              }`}
            >
              Farm to Market
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default GoviyaLogo;
