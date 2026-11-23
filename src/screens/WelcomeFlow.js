import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import ResponsiveScreen from '../components/ResponsiveScreen';
import BackgroundImage from '../components/BackgroundImage';
import { colors, font } from '../theme';
import { PageOne, PageThree, PageTwo } from './OnBoardingIllustrations';

const logo = require('../../assets/Vector book.png');

const PAGES = [
  {
    title: 'Organize your schedule',
    body: 'Keep tasks, appointments, and goals in one place. Plan your day and make time for what matters.',
  },
  {
    title: 'Track deadlines easily',
    body: 'See what is coming up and stay on top of important deadlines.',
  },
  {
    title: 'Monitor your progress',
    body: 'Celebrate completed tasks and build better habits, one day at a time.',
  },
];

const ILLUSTRATIONS = [PageOne, PageTwo, PageThree];

export default function WelcomeFlow({ onDone }) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPurple, setShowPurple] = useState(false);
  const [enter] = useState(() => new Animated.Value(0));
  const [slideOpacity] = useState(() => new Animated.Value(1));
  const [transition] = useState(() => new Animated.Value(0));
  const isShortScreen = height < 700;
  const isVeryShortScreen = height < 580;
  const illustrationWidth = Math.min(
    width - (width < 360 ? 24 : 40),
    isVeryShortScreen ? 160 : isShortScreen ? 220 : 320,
    height * 0.34,
  );
  const horizontalPadding = width < 360 ? 12 : 20;
  const titleSize = isVeryShortScreen ? 19 : isShortScreen ? 21 : 23;
  const bodySize = isVeryShortScreen ? 12 : isShortScreen ? 13 : 14;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(enter, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
        setReady(true);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [enter]);

  const goTo = (nextIndex) => {
    slideOpacity.stopAnimation();
    slideOpacity.setValue(0);
    setIndex(nextIndex);
    Animated.timing(slideOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  };

  const finish = () => {
    if (busy) return;
    setBusy(true);
    setShowPurple(true);
    Animated.timing(transition, { toValue: 1, duration: 420, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onDone();
    });
  };

  const onNext = () => {
    if (!ready || busy) return;
    if (index < PAGES.length - 1) {
      goTo(index + 1);
    } else {
      finish();
    }
  };

  const onLeftLink = () => {
    if (!ready || busy) return;
    if (index === 0) {
      finish();
    } else {
      goTo(index - 1);
    }
  };

  return (
    <View style={styles.root}>
      <BackgroundImage />
      <ResponsiveScreen>
        <View style={[styles.page, { paddingHorizontal: horizontalPadding }, isVeryShortScreen && styles.compactPage]}>
          <View style={[styles.brandRow, isVeryShortScreen && styles.compactBrandRow]}>
            <Image source={logo} contentFit="contain" style={[styles.brandImage, isVeryShortScreen && styles.compactBrandImage]} />
            <Text style={styles.wordmark}>
              <Text style={styles.wordTask}>Task</Text>
              <Text style={styles.wordMate}>Mate</Text>
            </Text>
          </View>

          <Animated.View
            style={[
              styles.main,
              {
                opacity: enter,
                transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.slide,
                {
                  opacity: slideOpacity,
                  transform: [{ translateX: slideOpacity.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                },
              ]}
            >
              {React.createElement(ILLUSTRATIONS[index], { illustrationWidth })}
              <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 7 }, isVeryShortScreen && styles.compactTitle]}>
                {PAGES[index].title}
              </Text>
              <Text style={[styles.body, { fontSize: bodySize, lineHeight: bodySize + 7 }, isVeryShortScreen && styles.compactBody]}>
                {PAGES[index].body}
              </Text>
            </Animated.View>
          </Animated.View>

          <View style={styles.footer}>
            <Pressable onPress={onLeftLink} disabled={!ready || busy} hitSlop={10} style={styles.sideAction}>
              <Text style={[styles.sideActionText, (!ready || busy) && styles.disabledText]}>
                {index === 0 ? 'Skip' : 'Back'}
              </Text>
            </Pressable>

            <View style={styles.dots} accessibilityLabel={`Page ${index + 1} of ${PAGES.length}`}>
              {PAGES.map((page, pageIndex) => (
                <View
                  key={page.title}
                  style={[styles.dot, pageIndex === index && styles.activeDot]}
                />
              ))}
            </View>

            <Pressable
              onPress={onNext}
              disabled={!ready || busy}
              style={[styles.nextButton, (!ready || busy) && styles.disabledButton]}
              accessibilityRole="button"
            >
              <Text style={styles.nextButtonText}>{index === PAGES.length - 1 ? 'Get started' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>
      </ResponsiveScreen>

      {showPurple && (
        <Animated.View
          pointerEvents="none"
          style={[styles.transition, { opacity: transition }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f5f0ff' },
  page: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  compactPage: { paddingTop: 4, paddingBottom: 8 },
  brandRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  compactBrandRow: { minHeight: 38 },
  brandImage: { width: 42, height: 42 },
  compactBrandImage: { width: 34, height: 34 },
  wordmark: { fontFamily: font.bold, fontSize: 24 },
  wordTask: { color: '#111' },
  wordMate: { color: colors.purple },
  main: { flex: 1, minHeight: 0, justifyContent: 'center' },
  slide: { flex: 1, width: '100%', minHeight: 0, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingHorizontal: 4 },
  title: { width: '100%', marginTop: 18, textAlign: 'center', fontFamily: font.bold, fontSize: 23, lineHeight: 30, color: '#17121e' },
  compactTitle: { marginTop: 6 },
  body: { width: '100%', maxWidth: 360, marginTop: 8, textAlign: 'center', fontFamily: font.medium, fontSize: 14, lineHeight: 21, color: '#645c70' },
  compactBody: { marginTop: 4 },
  footer: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12 },
  sideAction: { minWidth: 52, minHeight: 44, alignItems: 'flex-start', justifyContent: 'center' },
  sideActionText: { fontFamily: font.semi, fontSize: 14, color: colors.purple },
  disabledText: { opacity: 0.5 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(172,77,255,0.3)' },
  activeDot: { width: 22, backgroundColor: colors.purple },
  nextButton: { minWidth: 104, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 23, backgroundColor: colors.purple },
  nextButtonText: { fontFamily: font.semi, fontSize: 14, color: '#fff' },
  disabledButton: { opacity: 0.6 },
  transition: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.purple },
});
