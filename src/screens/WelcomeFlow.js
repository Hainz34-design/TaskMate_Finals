import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';
import { PageOne, PageThree, PageTwo } from './OnBoardingIllustrations';

const book = require('../../assets/book.svg');

const PAGES = [
  {
    title: 'Organize Your Schedule',
    body: 'Keep all your tasks, appointments, personal goals, and daily activities organized in one place. Plan your day, manage your time, and never miss an important task again.',
    bodyTop: 595,
  },
  {
    title: 'Track Deadlines Easily',
    body: 'Get reminders for upcoming tasks and important events so you never miss a deadline.',
    bodyTop: 610,
  },
  {
    title: 'Monitor Your Progress',
    body: 'Track completed tasks, monitor your productivity, and build better study habits every day.',
    bodyTop: 600,
  },
];
const ILLUSTRATIONS = [PageOne, PageTwo, PageThree];

const play = (a) => new Promise((resolve) => a.start(() => resolve()));

/**
 * Splash 1-4  : animated intro (logo, white circle, logo moves up)
 * Splash 5-8  : three onboarding pages
 * Splash 9-10 : "Get Started" shrinks, purple circle grows, hands over to login
 */
export default function WelcomeFlow({ onDone }) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [whiteBg, setWhiteBg] = useState(false);
  const [showPurple, setShowPurple] = useState(false);

  const circle = useRef(new Animated.Value(8 / 1066)).current; // starts as the 8px dot on the book
  const bookScale = useRef(new Animated.Value(1.2)).current; // 187px -> 155px
  const mate = useRef(new Animated.Value(0)).current; // white -> purple
  const enter = useRef(new Animated.Value(0)).current; // 0 = splash, 1 = onboarding
  const pos = useRef(new Animated.Value(0)).current; // current onboarding page
  const pill = useRef(new Animated.Value(0)).current; // 0 = round button, 1 = "Get Started"
  const purple = useRef(new Animated.Value(53 / 1885)).current;

  useEffect(() => {
    let alive = true;
    (async () => {
      await play(Animated.delay(500));
      await play(Animated.timing(bookScale, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      await play(
        Animated.parallel([
          Animated.timing(circle, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
          Animated.timing(mate, { toValue: 1, duration: 900, useNativeDriver: false }),
        ]),
      );
      if (!alive) return;
      setWhiteBg(true);
      await play(Animated.delay(250));
      await play(Animated.timing(enter, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const goTo = (i) => {
    setIndex(i);
    Animated.spring(pos, { toValue: i, bounciness: 0, speed: 14, useNativeDriver: false }).start();
    Animated.timing(pill, { toValue: i === 2 ? 1 : 0, duration: 300, useNativeDriver: false }).start();
  };

  const finish = async () => {
    setBusy(true);
    await play(Animated.timing(pill, { toValue: 0, duration: 250, useNativeDriver: false })); // splash 9
    setShowPurple(true);
    await play(Animated.timing(purple, { toValue: 1, duration: 650, easing: Easing.in(Easing.cubic), useNativeDriver: true })); // splash 10
    onDone();
  };

  const onNext = () => {
    if (!ready || busy) return;
    index < 2 ? goTo(index + 1) : finish();
  };
  const onLeftLink = () => {
    if (!ready || busy) return;
    index === 0 ? finish() : goTo(index - 1);
  };

  const buttonWidth = pill.interpolate({ inputRange: [0, 1], outputRange: [53, 142] });
  const buttonLeft = Animated.subtract(379, buttonWidth);

  return (
    <View style={[styles.root, whiteBg && { backgroundColor: '#fff' }]}>
      {!whiteBg && (
        <LinearGradient
          colors={['#ac4dff', '#dddeff']}
          locations={[0.044, 0.7558]}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.75, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <ScaledCanvas>
        {/* white circle growing out of the dot on the book */}
        {!whiteBg && (
          <Animated.View style={[styles.whiteCircle, { transform: [{ scale: circle }] }]} />
        )}

        {/* onboarding content */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [310, 0] }) }] },
          ]}
        >
          {ILLUSTRATIONS.map((Page, i) => (
            <Animated.View
              key={`art-${i}`}
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: pos.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [330, 0, -330] }) }] },
              ]}
            >
              <Page />
            </Animated.View>
          ))}
          {PAGES.map((p, i) => (
            <Animated.View
              key={`txt-${i}`}
              style={[
                StyleSheet.absoluteFill,
                { opacity: pos.interpolate({ inputRange: [i - 0.5, i, i + 0.5], outputRange: [0, 1, 0], extrapolate: 'clamp' }) },
              ]}
            >
              <Text style={styles.title}>{p.title}</Text>
              <Text style={[styles.body, { top: p.bodyTop }]}>{p.body}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* logo: centred during the splash, moves to the top for onboarding */}
        <Animated.View
          style={[styles.logo, { transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [0, -350] }) }] }]}
        >
          <Text style={styles.logoTask}>Task</Text>
          <Animated.Text
            style={[styles.logoMate, { color: mate.interpolate({ inputRange: [0, 1], outputRange: ['#ffffff', colors.purpleText] }) }]}
          >
            Mate
          </Animated.Text>
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.book,
            { transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [0, -440] }) }, { scale: bookScale }] },
          ]}
        >
          <Image source={book} contentFit="contain" style={{ width: 155, height: 124 }} />
        </Animated.View>

        {/* controls */}
        <Animated.View
          pointerEvents={ready ? 'box-none' : 'none'}
          style={[StyleSheet.absoluteFill, { opacity: enter.interpolate({ inputRange: [0.6, 1], outputRange: [0, 1], extrapolate: 'clamp' }) }]}
        >
          <Pressable onPress={onLeftLink} style={styles.leftLink} hitSlop={12}>
            <Text style={styles.leftLinkText}>{index === 0 ? 'Skip' : 'back'}</Text>
          </Pressable>

          <View style={styles.dots}>
            {PAGES.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: pos.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [9, 29, 9], extrapolate: 'clamp' }),
                    opacity: pos.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' }),
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View style={[styles.button, { width: buttonWidth, left: buttonLeft }]}>
            <Pressable onPress={onNext} style={StyleSheet.absoluteFill}>
              <Animated.View style={[styles.arrow, { opacity: pill.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }) }]}>
                <Svg width={53} height={52} viewBox="0 0 53 52">
                  <Path d="M16 26H34M27 17.5L35.5 26L27 34.5" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </Animated.View>
              <Animated.View style={[styles.buttonLabelWrap, { opacity: pill.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' }) }]}>
                <Text style={styles.buttonLabel} numberOfLines={1}>Get Started</Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* purple circle growing out of the button (splash 10) */}
        {showPurple && <Animated.View pointerEvents="none" style={[styles.purpleCircle, { transform: [{ scale: purple }] }]} />}
      </ScaledCanvas>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ddddff' },
  whiteCircle: { position: 'absolute', left: -328, top: -134, width: 1066, height: 1066, borderRadius: 533, backgroundColor: '#fff' },
  purpleCircle: { position: 'absolute', left: -589, top: -117, width: 1885, height: 1885, borderRadius: 942.5, backgroundColor: colors.purple },
  logo: { position: 'absolute', left: 112, top: 437, flexDirection: 'row' },
  logoTask: { fontFamily: font.bold, fontSize: 36, lineHeight: 54, color: '#000' },
  logoMate: { fontFamily: font.bold, fontSize: 36, lineHeight: 54 },
  book: { position: 'absolute', left: 123, top: 313, width: 155, height: 124 },
  title: { position: 'absolute', top: 559, left: 0, width: 402, textAlign: 'center', fontFamily: font.bold, fontSize: 24, color: '#000' },
  body: { position: 'absolute', left: 67, width: 273, textAlign: 'center', fontFamily: font.bold, fontSize: 14, lineHeight: 21, color: colors.grey },
  leftLink: { position: 'absolute', left: 19, top: 822, width: 60, alignItems: 'center' },
  leftLinkText: { fontFamily: font.medium, fontSize: 14, color: colors.grey, textDecorationLine: 'underline' },
  dots: { position: 'absolute', left: 182, top: 703, height: 9, flexDirection: 'row', gap: 2 },
  dot: { height: 9, borderRadius: 5, backgroundColor: colors.purple },
  button: { position: 'absolute', top: 800, height: 52, borderRadius: 26, backgroundColor: colors.purple, overflow: 'hidden' },
  arrow: { position: 'absolute', right: 0, top: 0, width: 53, height: 52 },
  buttonLabelWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
});
