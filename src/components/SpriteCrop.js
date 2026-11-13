import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

/** Shows one piece of a sprite sheet, using the same percentages Figma exports. */
export default function SpriteCrop({ source, left, top, width, height, crop, radius = 0, borderColor }) {
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        overflow: 'hidden',
        borderRadius: radius,
        borderWidth: borderColor ? 1 : 0,
        borderColor,
      }}
    >
      <Image
        source={source}
        contentFit="fill"
        style={{ position: 'absolute', width: crop.w, height: crop.h, left: crop.l, top: crop.t }}
      />
    </View>
  );
}
