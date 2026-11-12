import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

const HIGH = { label: 'HIGH', color: '#ff6262', bg: 'rgba(255,98,98,0.22)', width: 45 };
const MEDIUM = { label: 'MEDIUM', color: '#ffae00', bg: 'rgba(255,216,0,0.26)', width: 61 };

const TODAY = [
  { id: 't1', title: 'Complete Database laboratory', code: 'DCIT55', priority: HIGH },
  { id: 't2', title: 'Review Open Source quiz', code: 'ITEC65B', priority: MEDIUM },
];
const UPCOMING = [
  { id: 'u1', title: 'Read lecture 2 - Java', code: 'DCIT25', dot: '#ac4dff' },
  { id: 'u2', title: 'Long quiz - UTS', code: 'GNED08', dot: '#ffae00' },
  { id: 'u3', title: 'Essay - Basketball', code: 'FITT4', dot: '#ff6262' },
  { id: 'u4', title: 'Answer Act 3 Page 20 - Graphics', code: 'ITEC70A', dot: '#ac4dff' },
  { id: 'u5', title: 'Laboratory - File Handling', code: 'ITEC60A', dot: '#ffae00' },
];
const TOTAL_TASKS = 7;

function Ring({ progress }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={95} height={95} viewBox="0 0 95 95">
      <Circle cx={47.5} cy={47.5} r={r} stroke="rgba(255,255,255,0.28)" strokeWidth={9} fill="none" />
      <Circle
        cx={47.5}
        cy={47.5}
        r={r}
        stroke="#fff"
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c * progress} ${c}`}
        rotation={-90}
        origin="47.5, 47.5"
      />
    </Svg>
  );
}

/** Splash 11 - home screen with bottom navigation. */
export default function HomeScreen() {
  const [done, setDone] = useState([]);
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  const toggle = (id) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const progress = done.length / TOTAL_TASKS;
  const pop = { opacity: intro, transform: [{ scale: intro.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] };

  return (
    <View style={styles.root}>
      <ScaledCanvas>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
            {/* header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.date}>Monday, Jun 1</Text>
                <Text style={styles.greeting}>Good Day,</Text>
                <Text style={[styles.greeting, { color: colors.purple }]}>Student!</Text>
              </View>
              <View style={styles.headerIcons}>
                <View style={styles.bell}>
                  <Ionicons name="notifications-outline" size={24} color={colors.purple} />
                </View>
                <LinearGradient colors={['#ac4dff', '#c98cfe']} style={styles.avatar}>
                  <Text style={styles.avatarText}>S</Text>
                </LinearGradient>
              </View>
            </View>

            {/* weekly progress */}
            <Animated.View style={[styles.cardWrap, pop]}>
              <LinearGradient colors={['#ac4dff', '#c98cfe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                <Text style={[styles.cardLabel, { left: 136, top: 16, opacity: 0.8 }]}>Weekly Progress</Text>
                <View style={{ position: 'absolute', left: 20, top: 24 }}>
                  <Ring progress={progress} />
                  <View style={styles.ringCenter}>
                    <Text style={styles.ringText}>{Math.round(progress * 100)}%</Text>
                  </View>
                </View>
                <Text style={[styles.cardBig, { left: 137, top: 40 }]}>{done.length} of {TOTAL_TASKS}</Text>
                <Text style={[styles.cardBig, { left: 137, top: 66 }]}>tasks done</Text>
                <Text style={[styles.cardSmall, { left: 137, top: 100 }]}>🔥 7-day streak</Text>
                <Text style={[styles.cardBig, { left: 310, top: 28 }]}>2</Text>
                <Text style={[styles.cardTiny, { left: 276, top: 52 }]}>today</Text>
                <Text style={[styles.cardBig, { left: 310, top: 70 }]}>4</Text>
                <Text style={[styles.cardTiny, { left: 258, top: 94 }]}>upcoming</Text>
              </LinearGradient>
            </Animated.View>

            {/* stats */}
            <Animated.View style={[styles.stats, pop]}>
              {[
                { value: '67', label: 'Focus Score', icon: 'flash-outline', tint: colors.purple },
                { value: '7', label: 'Subjects', icon: 'book-outline', tint: '#2f6bff' },
                { value: '4.5h', label: 'Study hrs', icon: 'time-outline', tint: '#ffc400' },
              ].map((s) => (
                <View key={s.label} style={styles.tile}>
                  <Ionicons name={s.icon} size={18} color={s.tint} />
                  <Text style={styles.tileValue}>{s.value}</Text>
                  <Text style={styles.tileLabel}>{s.label}</Text>
                </View>
              ))}
            </Animated.View>

            {/* today's tasks */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Today’s Tasks</Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{TODAY.length}</Text>
              </View>
            </View>
            {TODAY.map((t) => (
              <View key={t.id} style={styles.taskCard}>
                <Pressable onPress={() => toggle(t.id)} style={[styles.check, { borderColor: t.priority.color }, done.includes(t.id) && { backgroundColor: t.priority.color }]}>
                  {done.includes(t.id) && <Ionicons name="checkmark" size={18} color="#fff" />}
                </Pressable>
                <Text style={[styles.taskTitle, done.includes(t.id) && styles.struck]}>{t.title}</Text>
                <View style={styles.metaRow}>
                  <View style={[styles.badge, { backgroundColor: t.priority.bg, width: t.priority.width }]}>
                    <Text style={[styles.badgeText, { color: t.priority.color }]}>{t.priority.label}</Text>
                  </View>
                  <Text style={styles.code}>{t.code}</Text>
                </View>
              </View>
            ))}

            {/* upcoming */}
            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Upcoming</Text>
            {UPCOMING.map((u) => (
              <Pressable key={u.id} onPress={() => toggle(u.id)} style={styles.upCard}>
                <View style={[styles.upDot, { backgroundColor: done.includes(u.id) ? '#c8c8c8' : u.dot }]} />
                <Text style={[styles.taskTitle, { left: 52, top: 9 }, done.includes(u.id) && styles.struck]}>{u.title}</Text>
                <Text style={[styles.code, { position: 'absolute', left: 52, top: 32 }]}>{u.code}</Text>
              </Pressable>
            ))}
        </ScrollView>
      </ScaledCanvas>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 4 }, elevation: 4 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { position: 'absolute', left: 30, top: 47, width: 342, height: 733 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', height: 106 },
  date: { fontFamily: font.medium, fontSize: 16, color: colors.lightGrey, lineHeight: 24 },
  greeting: { fontFamily: font.bold, fontSize: 24, lineHeight: 36, color: '#000' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  bell: { width: 45, height: 44, borderRadius: 15, backgroundColor: 'rgba(229,199,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.bold, fontSize: 20, color: '#fff' },
  cardWrap: { height: 136, marginBottom: 19 },
  card: { flex: 1, borderRadius: 22, ...shadow, shadowOpacity: 0.2 },
  cardLabel: { position: 'absolute', fontFamily: font.semi, fontSize: 15, color: '#fff' },
  cardBig: { position: 'absolute', fontFamily: font.bold, fontSize: 20, color: '#fff' },
  cardSmall: { position: 'absolute', fontFamily: font.semi, fontSize: 14, color: '#fff', opacity: 0.8 },
  cardTiny: { position: 'absolute', fontFamily: font.medium, fontSize: 10, color: '#fff', opacity: 0.75 },
  ringCenter: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringText: { fontFamily: font.bold, fontSize: 24, color: '#fff' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', height: 92 },
  tile: { width: 104, height: 92, borderRadius: 16, backgroundColor: '#fff', paddingHorizontal: 14, justifyContent: 'center', ...shadow, shadowOpacity: 0.12 },
  tileValue: { fontFamily: font.bold, fontSize: 19, color: '#000', lineHeight: 28 },
  tileLabel: { fontFamily: font.semi, fontSize: 12, color: colors.lightGrey, opacity: 0.75 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 32, marginBottom: 12 },
  sectionTitle: { fontFamily: font.bold, fontSize: 23, color: '#000' },
  countPill: { marginLeft: 'auto', width: 27, height: 20, borderRadius: 19, backgroundColor: 'rgba(229,199,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: font.semi, fontSize: 10, color: colors.purple },
  taskCard: { height: 79, borderRadius: 12, backgroundColor: '#fff', marginBottom: 21, ...shadow },
  check: { position: 'absolute', left: 12, top: 13, width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { position: 'absolute', left: 52, top: 16, fontFamily: font.semi, fontSize: 15, color: '#000' },
  struck: { textDecorationLine: 'line-through', opacity: 0.5 },
  metaRow: { position: 'absolute', left: 52, top: 42, flexDirection: 'row', alignItems: 'center', gap: 7 },
  badge: { height: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: font.bold, fontSize: 12 },
  code: { fontFamily: font.semi, fontSize: 12, color: colors.lightGrey, opacity: 0.8 },
  upCard: { height: 61, borderRadius: 13, backgroundColor: '#fff', marginTop: 19, ...shadow },
  upDot: { position: 'absolute', left: 20, top: 26, width: 9, height: 9, borderRadius: 5 },
});
