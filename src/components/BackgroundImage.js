import React from 'react';
import { Image, StyleSheet } from 'react-native';

const backgroundImage = require('../../assets/bgImageClear.png');

export default function BackgroundImage({ style, opacity = 1 }) {
  return (
    <Image
      source={backgroundImage}
      pointerEvents="none"
      style={[
        styles.background,
        { opacity },
        style,
      ]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
});