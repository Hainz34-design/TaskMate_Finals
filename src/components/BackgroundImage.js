import React from 'react';
import { Image, StyleSheet } from 'react-native';


export default function BackgroundImage({ style, opacity = 1 }) {
  return (
    <Image
      source={require('../../assets/bground.png')}
      style={StyleSheet.absoluteFill}
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