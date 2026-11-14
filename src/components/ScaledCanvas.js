import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { DESIGN_H, DESIGN_W } from '../theme';

// Panatilihin ang Figma coordinates habang ipinapaliit o pinalalaki sa device.
export default function ScaledCanvas({ children }) {
  const { width, height } = useWindowDimensions();
  // Width at height ratios ang sinusukat; piliin ang mas maliit para walang crop.
  const scale = Math.min(width / DESIGN_W, height / DESIGN_H);
  // Ang natirang space sa bawat side ang ginagamit para i-center ang canvas.
  return (
    <View
      style={{
        position: 'absolute',
        left: (width - DESIGN_W) / 2,
        top: (height - DESIGN_H) / 2,
        width: DESIGN_W,
        height: DESIGN_H,
        overflow: 'hidden',
        transform: [{ scale }],
      }}
    >
      {children}
    </View>
  );
}
