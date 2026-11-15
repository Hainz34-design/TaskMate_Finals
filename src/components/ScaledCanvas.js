import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DESIGN_H, DESIGN_W } from '../theme';

export default function ScaledCanvas({ children }) {
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });
  const scale = Math.min(viewport.width / DESIGN_W, viewport.height / DESIGN_H);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, overflow: 'hidden' }}
        onLayout={({ nativeEvent }) => {
          const { width, height } = nativeEvent.layout;
          setViewport((current) =>
            current.width === width && current.height === height
              ? current
              : { width, height },
          );
        }}
      >
        {viewport.width > 0 && viewport.height > 0 && (
          <View
            style={{
              position: 'absolute',
              left: (viewport.width - DESIGN_W) / 2,
              top: (viewport.height - DESIGN_H) / 2,
              width: DESIGN_W,
              height: DESIGN_H,
              overflow: 'hidden',
              transform: [{ scale }],
            }}
          >
            {children}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
