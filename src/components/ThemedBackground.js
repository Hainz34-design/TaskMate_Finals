import React from 'react';
import { StyleSheet, View } from 'react-native';
import BackgroundImage from './BackgroundImage';
import { useTheme } from '../ThemeContext';

// Your normal background picture, with a dark layer on top when Dark Mode is on
export default function ThemedBackground() {
  const { dark, theme } = useTheme();
  return (
    <>
      <BackgroundImage />
      {dark ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay }]} />
      ) : null}
    </>
  );
}
