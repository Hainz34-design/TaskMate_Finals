import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';

function PageIllustration({ source }) {
  return (
    <View style={styles.illustration}>
      <View style={styles.outerRing}>
        <View style={styles.innerRing} />
      </View>
      <Image source={source} contentFit="contain" style={styles.illustrationImage} />
    </View>
  );
}

export const PageOne = () => (
  <PageIllustration source={require('../../assets/page1.png')} />
);

export const PageTwo = () => (
  <PageIllustration source={require('../../assets/page2.png')} />
);

export const PageThree = () => (
  <PageIllustration source={require('../../assets/page3.png')} />
);

const styles = StyleSheet.create({
  illustration: { width: '100%', maxWidth: 380, aspectRatio: 1.22, alignSelf: 'center', justifyContent: 'center' },
  illustrationImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
  outerRing: { position: 'absolute', top: '8%', width: '72%', aspectRatio: 1, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.ringOuter },
  innerRing: { width: '72%', aspectRatio: 1, borderRadius: 999, backgroundColor: colors.ringInner },
});
