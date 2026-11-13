import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { DESIGN_H, DESIGN_W } from '../theme';

/**
 * The Figma frames are 402 x 874. Every screen is laid out in that coordinate
 * space and scaled to fit the device, so positions match the design 1:1.
 */
export default function ScaledCanvas({ children }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / DESIGN_W, height / DESIGN_H);
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
