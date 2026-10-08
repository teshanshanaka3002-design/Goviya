import React from 'react';
import { View, Text } from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  G,
  Defs,
  ClipPath,
} from 'react-native-svg';

export interface GoviyaMarketplaceBadgeProps {
  size?: number;
  shape?: 'circle' | 'square';
}

export const GoviyaMarketplaceBadge: React.FC<GoviyaMarketplaceBadgeProps> = ({
  size = 72,
  shape = 'circle',
}) => {
  const borderRadius = shape === 'circle' ? size / 2 : size * 0.22;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size * 0.08,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
      }}
    >
      <Svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* Left Side: Paddy / Crop Sheaf */}
        <G id="crops">
          {/* Main stalk */}
          <Path
            d="M 28 60 Q 22 45 28 28"
            stroke="#2E7D32"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Leaves */}
          <Path
            d="M 27 52 Q 18 48 20 42 C 24 45 27 48 27 52 Z"
            fill="#4CAF50"
          />
          <Path
            d="M 25 43 Q 16 38 19 32 C 23 35 25 39 25 43 Z"
            fill="#4CAF50"
          />
          <Path
            d="M 26 34 Q 19 28 23 23 C 26 26 27 30 26 34 Z"
            fill="#388E3C"
          />
          <Path
            d="M 28 28 Q 25 20 28 16 C 31 20 30 24 28 28 Z"
            fill="#2E7D32"
          />
          <Path
            d="M 28 47 Q 35 44 33 39 C 30 42 28 44 28 47 Z"
            fill="#66BB6A"
          />
          <Path
            d="M 27 38 Q 34 34 32 29 C 29 32 27 35 27 38 Z"
            fill="#4CAF50"
          />
        </G>

        {/* Center: Friendly Farmer */}
        <G id="farmer">
          {/* Straw Hat */}
          {/* Brim */}
          <Path
            d="M 37 36 C 42 32 58 32 63 36 C 58 37 42 37 37 36 Z"
            fill="#FFA000"
          />
          {/* Crown */}
          <Path
            d="M 43 35 C 43 27 57 27 57 35 Z"
            fill="#FFB300"
          />
          {/* Hat band */}
          <Path
            d="M 43 34 Q 50 33 57 34"
            stroke="#D32F2F"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Farmer Face */}
          <Circle cx="50" cy="40" r="6" fill="#FFCC80" />
          {/* Hair / Ears */}
          <Circle cx="44" cy="40" r="1.5" fill="#5D4037" />
          <Circle cx="56" cy="40" r="1.5" fill="#5D4037" />
          {/* Eyes & smile */}
          <Circle cx="48" cy="39.5" r="0.7" fill="#374151" />
          <Circle cx="52" cy="39.5" r="0.7" fill="#374151" />
          <Path
            d="M 48.5 42 Q 50 43.5 51.5 42"
            stroke="#E65100"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Farmer Shirt */}
          <Path
            d="M 43 46 C 43 45 47 44 50 44 C 53 44 57 45 57 46 L 59 52 L 41 52 Z"
            fill="#1E88E5"
          />
          <Path
            d="M 47 44 L 50 48 L 53 44"
            fill="#FFFFFF"
          />
        </G>

        {/* Right curved blue delivery arrow */}
        <Path
          d="M 59 30 C 66 31 72 36 74 43"
          stroke="#03A9F4"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 72 45 L 75 42 L 77 46 Z"
          fill="#03A9F4"
        />

        {/* Shopping Cart & Pin */}
        <G id="cart-and-pin">
          {/* Cart Basket */}
          <Path
            d="M 43 54 L 46 54 L 49 63 L 61 63 L 64 56 L 48 56"
            stroke="#F57C00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Cart Wheels */}
          <Circle cx="50.5" cy="65.5" r="1.6" fill="#F57C00" />
          <Circle cx="59.5" cy="65.5" r="1.6" fill="#F57C00" />

          {/* Location Marker Pin inside cart */}
          <Path
            d="M 55 52 C 52.8 52 51 53.8 51 56 C 51 58.8 55 62 55 62 C 55 62 59 58.8 59 56 C 59 53.8 57.2 52 55 52 Z"
            fill="#E53935"
          />
          <Circle cx="55" cy="55.5" r="1.5" fill="#FFFFFF" />

          {/* Fresh Green Sprout in cart */}
          <Path
            d="M 47 55 Q 44 52 46 49 C 48 50 48 53 47 55 Z"
            fill="#4CAF50"
          />
        </G>

        {/* Brand Text: Goviya */}
        <Path
          d="M 33 76"
          fill="none"
        />
      </Svg>
      {/* Brand Label Under Artwork */}
      <View style={{ alignItems: 'center', marginTop: -size * 0.12 }}>
        <Text
          style={{
            fontSize: size * 0.17,
            fontWeight: '900',
            color: '#1B5E39',
            letterSpacing: -0.3,
            lineHeight: size * 0.2,
          }}
        >
          Goviya
        </Text>
        <Text
          style={{
            fontSize: size * 0.065,
            fontWeight: '800',
            color: '#B91C1C',
            letterSpacing: 0.8,
            marginTop: -1,
          }}
        >
          MARKETPLACE
        </Text>
      </View>
    </View>
  );
};
export default GoviyaMarketplaceBadge;
