import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';

const Rings = () => (
  <>
    <View style={{ position: 'absolute', left: 76, top: 253, width: 250, height: 250, borderRadius: 125, backgroundColor: colors.ringOuter }} />
    <View style={{ position: 'absolute', left: 111, top: 288, width: 180, height: 180, borderRadius: 90, backgroundColor: colors.ringInner }} />
  </>
);

/** Splash 5 - Organize Your Schedule */
export const PageOne = () => (
  <>
    <Rings />
    <View
      style={{
        position: 'absolute',
        left: 29,
        top: 302,
        width: 343,
        height: 240,
        borderRadius: 24,
        backgroundColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View style={{ position: 'absolute', left: 22, top: 22, width: 250, height: 16, borderRadius: 8, backgroundColor: '#efe2ff' }} />
      <View style={{ position: 'absolute', left: 22, top: 54, width: 178, height: 12, borderRadius: 8, backgroundColor: '#f4ecff' }} />
      <View style={{ position: 'absolute', left: 22, top: 80, width: 200, height: 12, borderRadius: 8, backgroundColor: '#f4ecff' }} />
      <View style={{ position: 'absolute', left: 22, top: 120, width: 223, height: 82, borderRadius: 20, backgroundColor: '#f3e9ff' }} />
      <View style={{ position: 'absolute', left: 259, top: 124, width: 62, height: 62, borderRadius: 16, backgroundColor: '#c691ff' }} />
    </View>
    <View
      style={{
        position: 'absolute',
        left: 150,
        top: 262,
        width: 102,
        height: 61,
        borderRadius: 18,
        backgroundColor: '#7e33ff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>✓</Text>
    </View>
  </>
);

/** Splash 6 - Track Deadlines Easily */
export const PageTwo = () => (
  <>
    <Rings />
    <View style={{ position: 'absolute', left: 92, top: 337, width: 212, height: 131, borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 20, top: 20, width: 120, height: 16, borderRadius: 8, backgroundColor: '#f3e9ff' }} />
      <View style={{ position: 'absolute', left: 20, top: 48, width: 92, height: 12, borderRadius: 8, backgroundColor: '#efe2ff' }} />
      <View style={{ position: 'absolute', left: 20, top: 68, width: 142, height: 12, borderRadius: 8, backgroundColor: '#efe2ff' }} />
      <View style={{ position: 'absolute', left: 20, top: 96, width: 166, height: 12, borderRadius: 8, backgroundColor: '#efe2ff' }} />
      <View style={{ position: 'absolute', right: 18, top: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: '#c691ff' }} />
    </View>
    <View style={{ position: 'absolute', left: 71, top: 260, width: 260, height: 97, borderRadius: 18, backgroundColor: '#fff', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 18, top: 22, width: 80, height: 12, borderRadius: 8, backgroundColor: '#eee3ff' }} />
      <View style={{ position: 'absolute', left: 18, top: 48, width: 142, height: 12, borderRadius: 8, backgroundColor: '#f3e9ff' }} />
      <View style={{ position: 'absolute', right: 18, top: 16, width: 54, height: 54, borderRadius: 14, backgroundColor: '#eedbff' }} />
    </View>
    <View style={{ position: 'absolute', left: 158, top: 197, width: 85, height: 86, borderRadius: 22, backgroundColor: '#f3e9ff', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#7e33ff' }} />
    </View>
    <View style={{ position: 'absolute', left: 80, top: 465, width: 187, height: 43, borderRadius: 17, backgroundColor: 'rgba(172,77,255,0.15)', borderWidth: 1, borderColor: 'rgba(172,77,255,0.33)', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: '#7e33ff', fontWeight: '700' }}>Due tomorrow</Text>
    </View>
    <View style={{ position: 'absolute', left: 258, top: 434, width: 81, height: 89, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#eedbff' }} />
    </View>
  </>
);

/** Splash 7/8 - Monitor Your Progress */
export const PageThree = () => (
  <>
    <Rings />
    <View style={{ position: 'absolute', left: 48, top: 216, width: 143, height: 131, borderRadius: 20, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', left: 20, top: 20, width: 14, height: 66, borderRadius: 9, backgroundColor: '#eedbff' }} />
      <View style={{ position: 'absolute', left: 44, top: 44, width: 14, height: 42, borderRadius: 9, backgroundColor: '#d7aefc' }} />
      <View style={{ position: 'absolute', left: 68, top: 30, width: 14, height: 56, borderRadius: 9, backgroundColor: '#c691ff' }} />
      <View style={{ position: 'absolute', left: 92, top: 58, width: 14, height: 28, borderRadius: 9, backgroundColor: '#7e33ff' }} />
      <View style={{ position: 'absolute', left: 18, top: 98, width: 100, height: 12, borderRadius: 8, backgroundColor: '#efe2ff' }} />
    </View>
    <View style={{ position: 'absolute', left: 77, top: 295, width: 241, height: 177, borderRadius: 22, backgroundColor: '#fff', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 18, top: 18, width: 128, height: 12, borderRadius: 8, backgroundColor: '#efe2ff' }} />
      <View style={{ position: 'absolute', left: 18, top: 44, width: 186, height: 12, borderRadius: 8, backgroundColor: '#f3e9ff' }} />
      <View style={{ position: 'absolute', left: 18, top: 82, width: 200, height: 60, borderRadius: 18, backgroundColor: '#f8f3ff', justifyContent: 'space-between', padding: 12, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ width: 22, height: 22, borderRadius: 10, backgroundColor: '#7e33ff' }} />
        <View style={{ width: 22, height: 38, borderRadius: 10, backgroundColor: '#b66dff' }} />
        <View style={{ width: 22, height: 52, borderRadius: 10, backgroundColor: '#d7aefc' }} />
        <View style={{ width: 22, height: 68, borderRadius: 10, backgroundColor: '#7e33ff' }} />
      </View>
    </View>
    <View style={{ position: 'absolute', left: 90, top: 184, width: 339, height: 235, borderRadius: 24, backgroundColor: '#fff', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 20, top: 18, width: 140, height: 18, borderRadius: 9, backgroundColor: '#f1e7ff' }} />
      <View style={{ position: 'absolute', left: 20, top: 46, width: 106, height: 12, borderRadius: 8, backgroundColor: '#efe2ff' }} />
      <View style={{ position: 'absolute', left: 34, bottom: 24, width: 28, height: 98, borderRadius: 12, backgroundColor: '#eedbff' }} />
      <View style={{ position: 'absolute', left: 78, bottom: 24, width: 28, height: 118, borderRadius: 12, backgroundColor: '#d7aefc' }} />
      <View style={{ position: 'absolute', left: 122, bottom: 24, width: 28, height: 72, borderRadius: 12, backgroundColor: '#b66dff' }} />
      <View style={{ position: 'absolute', left: 166, bottom: 24, width: 28, height: 137, borderRadius: 12, backgroundColor: '#7e33ff' }} />
    </View>
    <View style={{ position: 'absolute', left: 253, top: 419, width: 87, height: 91, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 50, height: 50, borderRadius: 18, backgroundColor: '#efdfff' }} />
    </View>
  </>
);
