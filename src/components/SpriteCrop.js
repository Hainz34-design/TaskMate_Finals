import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

// Ipakita ang bahagi lang ng sprite image na tinutukoy ng crop coordinates.
export default function SpriteCrop({ source, left, top, width, height, crop, radius = 0, borderColor }) {
  // crop.l/crop.t ang image offset; crop.w/crop.h ang buong image dimensions.
  return (
    // Clip ng wrapper ang image para hindi makita ang pixels sa labas ng frame.
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
      {/* Ilipat at i-size ang buong sprite para ang target na bahagi lang ang makita. */}
      <Image
        source={source}
        contentFit="fill"
        style={{ position: 'absolute', width: crop.w, height: crop.h, left: crop.l, top: crop.t }}
      />
    </View>
  );
}
