import React from 'react';
import { StyleSheet, View } from 'react-native';
import ThemedBackground from './ThemedBackground';
import { useTheme } from '../ThemeContext';

// Wrap a screen in this to get the shared background (light or dark)
export default function ScreenBackground({ children, style }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.bg }, style]}>
      <ThemedBackground />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});