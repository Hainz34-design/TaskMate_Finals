import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';

const page1Image = require('../../assets/page1.png');

const Rings = () => (
  <>
    <View style={{ position: 'absolute', left: 76, top: 253, width: 250, height: 250, borderRadius: 125, backgroundColor: colors.ringOuter }} />
    <View style={{ position: 'absolute', left: 111, top: 288, width: 180, height: 180, borderRadius: 90, backgroundColor: colors.ringInner }} />
  </>
);

export const PageOne = () => (
  <>
    <Rings />
    <Image
      source={page1Image}
      contentFit="contain"
      style={{
        position: 'absolute',
        left: 29,
        top: 245,
        width: 343,
        height: 279,
      }}
    />
  </>
);

export const PageTwo = () => (
  <>
    <Rings />
    <Image
      source={require('../../assets/page2.png')}
      contentFit="contain"
      style={{
        position: 'absolute',
        left: 29,
        top: 245,
        width: 343,
        height: 279,
      }}
    />
  </>
);

export const PageThree = () => (
  <>
    <Rings />
    <Image
      source={require('../../assets/page3.png')}
      contentFit="contain"
      style={{
        position: 'absolute',
        left: 29,
        top: 245,
        width: 343,
        height: 279,
      }}
    />
  </>
);
