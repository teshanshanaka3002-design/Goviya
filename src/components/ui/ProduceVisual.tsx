import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Ellipse, Rect } from 'react-native-svg';

interface ProduceVisualProps {
  type: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_STYLES = {
  sm: { width: 40, height: 40, borderRadius: 10, borderWidth: 1 },
  md: { width: 68, height: 68, borderRadius: 14, borderWidth: 1 },
  lg: { width: 96, height: 96, borderRadius: 18, borderWidth: 1.5 },
  xl: { width: '100%' as any, height: 160, borderRadius: 20, borderWidth: 1.5 },
};

export const ProduceVisual: React.FC<ProduceVisualProps> = ({
  type,
  style,
  size = 'md',
}) => {
  const normType = (type || '').toLowerCase();
  const baseSize = SIZE_STYLES[size];

  // Helper to wrap svg in styled container
  const renderContainer = (bgColor: string, borderColor: string, svgContent: React.ReactNode) => (
    <View
      style={[
        styles.container,
        baseSize,
        { backgroundColor: bgColor, borderColor },
        style,
      ]}
    >
      <Svg viewBox="0 0 100 100" width="80%" height="80%">
        {svgContent}
      </Svg>
    </View>
  );

  // 1. CARROT
  if (normType.includes('carrot')) {
    return renderContainer('#FFF7ED', '#FDBA74', (
      <>
        <Path d="M48 32 C46 16, 38 12, 35 10 C38 18, 44 24, 48 30" stroke="#2D7A4D" strokeWidth="3.5" strokeLinecap="round" />
        <Path d="M52 30 C56 14, 62 10, 68 8 C62 18, 56 24, 52 30" stroke="#1F5C3A" strokeWidth="4" strokeLinecap="round" />
        <Path d="M50 30 C50 12, 50 8, 51 6" stroke="#48A36E" strokeWidth="3" strokeLinecap="round" />
        <Path
          d="M40 32 C42 28, 58 28, 60 32 C62 46, 56 82, 50 94 C44 82, 38 46, 40 32 Z"
          fill="url(#carrotGrad)"
        />
        <Path d="M43 45 Q50 47 57 44" stroke="#D95700" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M44 58 Q50 60 56 57" stroke="#D95700" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M46 72 Q50 74 54 71" stroke="#D95700" strokeWidth="1.8" strokeLinecap="round" />
        <Defs>
          <LinearGradient id="carrotGrad" x1="40" y1="30" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#FF7A00" />
            <Stop offset="0.6" stopColor="#E65100" />
            <Stop offset="1" stopColor="#BF360C" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 2. ONION / SHALLOT
  if (normType.includes('onion') || normType.includes('shallot')) {
    return renderContainer('#FDF2F8', '#F472B6', (
      <>
        <Path d="M48 88 L45 95 M50 88 L50 96 M52 88 L55 94" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
        <Path
          d="M50 18 C30 26, 22 50, 26 68 C30 84, 44 88, 50 88 C56 88, 70 84, 74 68 C78 50, 70 26, 50 18 Z"
          fill="url(#onionGrad)"
        />
        <Path d="M42 24 C32 40, 32 64, 42 82" stroke="#6A1B4D" strokeWidth="1.8" strokeLinecap="round" opacity={0.6} />
        <Path d="M58 24 C68 40, 68 64, 58 82" stroke="#6A1B4D" strokeWidth="1.8" strokeLinecap="round" opacity={0.6} />
        <Path d="M50 18 L50 88" stroke="#6A1B4D" strokeWidth="1.5" opacity={0.4} />
        <Path d="M50 18 L50 12" stroke="#8E2463" strokeWidth="3" strokeLinecap="round" />
        <Defs>
          <LinearGradient id="onionGrad" x1="25" y1="20" x2="75" y2="85" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#A22A5E" />
            <Stop offset="0.6" stopColor="#811746" />
            <Stop offset="1" stopColor="#4E0D2C" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 3. CHILLI / MIRIS
  if (normType.includes('chill') || normType.includes('miris')) {
    return renderContainer('#F0FDF4', '#86EFAC', (
      <>
        <Path d="M58 12 C52 18, 52 24, 52 28" stroke="#16452B" strokeWidth="4" strokeLinecap="round" />
        <Path d="M42 28 C48 24, 56 24, 62 28 C58 32, 46 32, 42 28 Z" fill="#2D7A4D" />
        <Path
          d="M44 28 C48 28, 60 28, 60 38 C60 52, 54 70, 44 86 C40 88, 38 84, 40 80 C46 66, 50 50, 48 38 C47 34, 45 32, 44 28 Z"
          fill="url(#chiliGrad)"
        />
        <Path d="M52 38 C54 48, 50 62, 44 76" stroke="#9AE6B4" strokeWidth="1.8" strokeLinecap="round" opacity={0.6} />
        <Defs>
          <LinearGradient id="chiliGrad" x1="42" y1="28" x2="60" y2="85" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#38A169" />
            <Stop offset="0.7" stopColor="#22543D" />
            <Stop offset="1" stopColor="#1C4532" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 4. LEEK
  if (normType.includes('leek')) {
    return renderContainer('#F0FDF4', '#86EFAC', (
      <>
        <Rect x="42" y="55" width="16" height="36" rx="4" fill="#F0FFF4" />
        <Path d="M46 91 L44 96 M50 91 L50 97 M54 91 L56 96" stroke="#CBD5E0" strokeWidth="1.5" strokeLinecap="round" />
        <Rect x="40" y="38" width="20" height="22" rx="3" fill="#68D391" />
        <Path d="M42 40 L30 14 C36 12, 44 22, 46 38 Z" fill="#22543D" />
        <Path d="M50 40 L50 10 C54 14, 52 24, 52 38 Z" fill="#276749" />
        <Path d="M58 40 L70 14 C64 12, 56 22, 54 38 Z" fill="#1C4532" />
      </>
    ));
  }

  // 5. TOMATO / THAKKALI
  if (normType.includes('tomato') || normType.includes('thakkali')) {
    return renderContainer('#FEF2F2', '#FCA5A5', (
      <>
        <Circle cx="50" cy="56" r="32" fill="url(#tomatoGrad)" />
        <Path d="M50 24 L50 16" stroke="#22543D" strokeWidth="3" strokeLinecap="round" />
        <Path d="M50 24 L42 20 M50 24 L58 20 M50 24 L44 28 M50 24 L56 28 M50 24 L50 30" stroke="#2F855A" strokeWidth="2.5" strokeLinecap="round" />
        <Ellipse cx="40" cy="45" rx="7" ry="4" transform="rotate(-30 40 45)" fill="white" opacity={0.45} />
        <Defs>
          <LinearGradient id="tomatoGrad" x1="30" y1="30" x2="70" y2="85" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#F56565" />
            <Stop offset="0.6" stopColor="#E53E3E" />
            <Stop offset="1" stopColor="#9B2C2C" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 6. PAPAYA / FRUIT
  if (normType.includes('papaya') || normType.includes('fruit')) {
    return renderContainer('#FFFBEB', '#FCD34D', (
      <>
        <Path
          d="M50 18 C38 18, 36 34, 30 52 C24 70, 32 86, 50 86 C68 86, 76 70, 70 52 C64 34, 62 18, 50 18 Z"
          fill="url(#papayaGrad)"
        />
        <Path d="M50 18 L50 12" stroke="#22543D" strokeWidth="3.5" strokeLinecap="round" />
        <Ellipse cx="42" cy="52" rx="4" ry="12" fill="#E28743" opacity={0.6} />
        <Defs>
          <LinearGradient id="papayaGrad" x1="35" y1="20" x2="65" y2="85" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#F6AD55" />
            <Stop offset="0.4" stopColor="#ED8936" />
            <Stop offset="0.8" stopColor="#DD6B20" />
            <Stop offset="1" stopColor="#2F855A" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 7. BRINJAL / WAMBATU
  if (normType.includes('brinjal') || normType.includes('wambatu') || normType.includes('eggplant')) {
    return renderContainer('#FAF5FF', '#D8B4FE', (
      <>
        <Path d="M50 14 C48 18, 50 24, 50 28" stroke="#16452B" strokeWidth="4" strokeLinecap="round" />
        <Path d="M38 28 C42 34, 48 30, 50 28 C52 30, 58 34, 62 28 C64 36, 56 38, 50 36 C44 38, 36 36, 38 28 Z" fill="#2D7A4D" />
        <Path
          d="M50 30 C38 32, 28 50, 30 70 C32 86, 44 92, 50 92 C56 92, 68 86, 70 70 C72 50, 62 32, 50 30 Z"
          fill="url(#brinjalGrad)"
        />
        <Ellipse cx="42" cy="56" rx="6" ry="16" transform="rotate(-15 42 56)" fill="white" opacity={0.35} />
        <Defs>
          <LinearGradient id="brinjalGrad" x1="30" y1="30" x2="70" y2="90" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#6B21A8" />
            <Stop offset="0.6" stopColor="#4C1D95" />
            <Stop offset="1" stopColor="#2E1065" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 8. OKRA / BANDAKKA
  if (normType.includes('okra') || normType.includes('bandakka') || normType.includes('ladies')) {
    return renderContainer('#F7FEE7', '#BEF264', (
      <>
        <Path d="M50 12 L50 22" stroke="#16452B" strokeWidth="4" strokeLinecap="round" />
        <Path d="M42 22 L58 22 L55 26 L45 26 Z" fill="#2D7A4D" />
        <Path
          d="M44 26 L56 26 L53 82 L50 92 L47 82 Z"
          fill="url(#okraGrad)"
        />
        <Path d="M50 26 L50 92" stroke="#1E5E38" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M47 26 L48 82" stroke="#A7F3D0" strokeWidth="1" strokeLinecap="round" opacity={0.7} />
        <Defs>
          <LinearGradient id="okraGrad" x1="44" y1="26" x2="56" y2="90" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#48BB78" />
            <Stop offset="0.6" stopColor="#2F855A" />
            <Stop offset="1" stopColor="#1C4532" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 9. GOURD / PATHOLA
  if (normType.includes('gourd') || normType.includes('pathola') || normType.includes('karawila')) {
    return renderContainer('#ECFDF5', '#6EE7B7', (
      <>
        <Path d="M46 14 C48 18, 50 20, 50 24" stroke="#16452B" strokeWidth="3" strokeLinecap="round" />
        <Path
          d="M48 24 C52 24, 56 36, 54 50 C52 66, 44 76, 46 88 C47 92, 51 92, 52 88 C54 74, 62 60, 60 46 C58 32, 54 24, 48 24 Z"
          fill="url(#gourdGrad)"
        />
        <Path d="M51 28 Q55 46 51 68" stroke="#D1FAE5" strokeWidth="1.5" strokeLinecap="round" opacity={0.8} />
        <Path d="M47 38 Q50 56 46 76" stroke="#D1FAE5" strokeWidth="1.5" strokeLinecap="round" opacity={0.8} />
        <Defs>
          <LinearGradient id="gourdGrad" x1="45" y1="24" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#34D399" />
            <Stop offset="0.6" stopColor="#059669" />
            <Stop offset="1" stopColor="#065F46" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // 10. MUKUNUWENNA / GREENS
  if (normType.includes('mukunuwenna') || normType.includes('gotukola') || normType.includes('leaf') || normType.includes('green')) {
    return renderContainer('#ECFDF5', '#34D399', (
      <>
        <Circle cx="50" cy="50" r="30" fill="url(#greensGrad)" />
        <Path d="M50 82 L50 40" stroke="#16452B" strokeWidth="3" strokeLinecap="round" />
        <Path d="M50 58 Q40 50 32 52" stroke="#16452B" strokeWidth="2" strokeLinecap="round" />
        <Path d="M50 48 Q60 42 68 44" stroke="#16452B" strokeWidth="2" strokeLinecap="round" />
        <Path d="M38 34 C30 40, 32 56, 44 54 C54 52, 50 32, 38 34 Z" fill="#4ADE80" opacity={0.85} />
        <Path d="M62 34 C70 40, 68 56, 56 54 C46 52, 50 32, 62 34 Z" fill="#22C55E" opacity={0.85} />
        <Defs>
          <LinearGradient id="greensGrad" x1="30" y1="30" x2="70" y2="80" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#86EFAC" />
            <Stop offset="0.5" stopColor="#22C55E" />
            <Stop offset="1" stopColor="#15803D" />
          </LinearGradient>
        </Defs>
      </>
    ));
  }

  // DEFAULT
  return renderContainer('#F0FDF4', '#86EFAC', (
    <>
      <Path
        d="M50 20 C32 20, 24 38, 24 56 C24 74, 36 84, 50 84 C64 84, 76 74, 76 56 C76 38, 68 20, 50 20 Z"
        fill="#38A169"
      />
      <Path d="M50 20 L50 84" stroke="#22543D" strokeWidth="2" strokeLinecap="round" />
      <Path d="M50 38 Q38 48 30 52" stroke="#22543D" strokeWidth="2" strokeLinecap="round" />
      <Path d="M50 50 Q62 60 70 64" stroke="#22543D" strokeWidth="2" strokeLinecap="round" />
    </>
  ));
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
