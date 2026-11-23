import React from 'react';
import { Image, StyleSheet } from 'react-native';


export default function BackgroundImage({ style, opacity = 1 }) {
  return (
    <Image
      source={require('../../assets/bground.png')}
      style={[StyleSheet.absoluteFill, styles.background, style]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
  },
});