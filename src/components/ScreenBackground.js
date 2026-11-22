import React from 'react';
import { StyleSheet, View } from 'react-native';
import BackgroundImage from './BackgroundImage';

// Wrap every screen in this so they all share the same background.
export default function ScreenBackground({ children, style }) {
  return (
    <View style={[styles.root, style]}>
      <BackgroundImage />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1e8ff' },
});
