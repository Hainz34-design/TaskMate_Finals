import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import BackgroundImage from '../components/BackgroundImage';
import { colors, font } from '../theme';

const logo = require('../../assets/Vector book.png');

export default function StartupSplash({ fontsLoaded }) {
  const [logoMotion] = useState(() => new Animated.Value(0));
  const [wordmarkMotion] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const logoAnimation = Animated.timing(logoMotion, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const wordmarkAnimation = Animated.timing(wordmarkMotion, {
      toValue: 1,
      duration: 450,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    Animated.parallel([logoAnimation, wordmarkAnimation]).start();
    return () => {
      logoAnimation.stop();
      wordmarkAnimation.stop();
    };
  }, [logoMotion, wordmarkMotion]);

  return (
    <View style={styles.root}>
      <BackgroundImage />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoMotion,
              transform: [{ scale: logoMotion.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }],
            },
          ]}
        >
          <Image source={logo} resizeMode="contain" style={styles.logo} accessibilityLabel="TaskMate logo" />
        </Animated.View>
        <Animated.Text
          style={[
            styles.wordmark,
            { fontFamily: fontsLoaded ? font.bold : undefined },
            {
              opacity: wordmarkMotion,
              transform: [{ translateY: wordmarkMotion.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            },
          ]}
        >
          <Text style={styles.wordTask}>Task</Text>
          <Text style={styles.wordMate}>Mate</Text>
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f0ff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { width: 124, height: 124 },
  logo: { width: 124, height: 124 },
  wordmark: { marginTop: 12, fontSize: 34, lineHeight: 42, fontWeight: '700' },
  wordTask: { color: '#17121e' },
  wordMate: { color: colors.purple },
});
