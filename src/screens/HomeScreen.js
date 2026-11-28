import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ResponsiveScreen from '../components/ResponsiveScreen';
import ThemedBackground from '../components/ThemedBackground';
import NotificationBell from '../components/NotificationBell';
import { colors, font } from '../theme';
import { useTheme } from '../ThemeContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatTodayDate(date = new Date()) {
  const dayName = WEEKDAYS[date.getDay()];
  const monthName = MONTHS[date.getMonth()];
  const dayNumber = date.getDate();
  return `${dayName}, ${monthName} ${dayNumber}`;
}

// dueDate is stored as MM/DD/YYYY. Returns a Date at midnight, or null if there is no due date.
function parseDue(task) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(task.dueDate || '');
  return m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : null;
}

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function Ring({ progress }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={72} height={72} viewBox="0 0 72 72">
      <Circle cx={36} cy={36} r={r} stroke="rgba(255,255,255,0.28)" strokeWidth={8} fill="none" />
      <Circle
        cx={36}
        cy={36}
        r={r}
        stroke="#fff"
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c * progress} ${c}`}
        transform="rotate(-90 36 36)"
      />
    </Svg>
  );
}

export default function HomeScreen({ user, tasks = [], onToggleTask, pushEnabled = false }) {
  const styles = useStyles();
  const { theme: t } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const displayName = user?.fullName?.trim().split(/\s+/)[0] || 'User';
  const [todayLabel] = useState(() => formatTodayDate(new Date()));

  const [intro] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [intro]);

  const toggle = (id) => onToggleTask && onToggleTask(id);

  /* ---------- task groups ---------- */
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  // This week = Monday to Sunday
  const weekStart = new Date(startOfToday);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const overdueTasks = tasks.filter((t) => {
    const d = parseDue(t);
    return d && d < startOfToday && !t.completed;
  });
  const todayTasks = tasks.filter((t) => {
    const d = parseDue(t);
    return d && d.getTime() === todayMs;
  });
  // Upcoming = due after today, or no due date
  const upcomingTasks = tasks.filter((t) => {
    const d = parseDue(t);
    return !d || d > startOfToday;
  });
  const weekTasks = tasks.filter((t) => {
    const d = parseDue(t);
    return d && d >= weekStart && d <= weekEnd;
  });

  /* ---------- numbers ---------- */
  const weekDone = weekTasks.filter((t) => t.completed).length;
  const progress = weekTasks.length > 0 ? weekDone / weekTasks.length : 0;

  const todayKey = dayKey(new Date());
  const doneToday = tasks.filter((t) => t.completed && t.updatedAt && dayKey(new Date(t.updatedAt)) === todayKey).length;
  const dueThisWeek = weekTasks.filter((t) => !t.completed && parseDue(t) >= startOfToday).length;

  // Streak = days in a row with at least one task finished (based on when it was last updated)
  const doneDays = new Set(
    tasks.filter((t) => t.completed && t.updatedAt).map((t) => dayKey(new Date(t.updatedAt)))
  );
  let streak = 0;
  const cursor = new Date();
  if (!doneDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // today may not be done yet
  while (doneDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const pop = { opacity: intro, transform: [{ scale: intro.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] };

  const renderTaskCard = (t, showDue) => (
    <View key={t.id} style={styles.taskCard}>
      <Pressable
        onPress={() => toggle(t.id)}
        style={[styles.check, { borderColor: t.priority.color }, t.completed && { backgroundColor: t.priority.color }]}
      >
        {t.completed && <Ionicons name="checkmark" size={18} color="#fff" />}
      </Pressable>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, t.completed && styles.struck]}>{t.title}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: t.priority.bg, paddingHorizontal: 10 }]}>
            <Text style={[styles.badgeText, { color: t.priority.color }]}>{t.priority.label}</Text>
          </View>
          {t.subject ? <Text style={styles.code}>{t.subject}</Text> : null}
          {showDue && t.dueDate ? <Text style={styles.code}>Due {t.dueDate}</Text> : null}
        </View>
      </View>
    </View>
  );

  const stats = [
    { value: String(doneToday), label: 'Done Today', icon: 'checkmark-circle-outline', tint: '#4cd964', valueColor: t.text },
    { value: String(overdueTasks.length), label: 'Overdue', icon: 'alert-circle-outline', tint: '#ff6262', valueColor: overdueTasks.length ? '#ff6262' : t.text },
    { value: String(dueThisWeek), label: 'Due This Week', icon: 'calendar-outline', tint: '#2f6bff', valueColor: t.text },
  ];

  return (
    <View style={styles.root}>
      <ThemedBackground />
      <ResponsiveScreen>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.date}>{todayLabel}</Text>
              <Text style={styles.greeting}>Good Day,</Text>
              <Text style={[styles.greeting, { color: colors.purple }]}>{displayName}!</Text>
            </View>
            <View style={styles.headerIcons}>
              <NotificationBell tasks={tasks} userId={user?.id} enabled={pushEnabled} />
              <LinearGradient colors={['#ac4dff', '#c98cfe']} style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Weekly progress card */}
          <Animated.View style={[styles.cardWrap, pop]}>
            <LinearGradient colors={['#ac4dff', '#c98cfe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
              <View style={styles.progressContent}>
                <View style={styles.ringContainer}>
                  <Ring progress={progress} />
                  <View style={styles.ringCenter}>
                    <Text style={styles.ringText}>{Math.round(progress * 100)}%</Text>
                  </View>
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.cardLabel}>Weekly Progress</Text>
                  <Text style={styles.cardBig}>{weekDone} of {weekTasks.length}</Text>
                  <Text style={styles.cardSmall}>done this week · 🔥 {streak}-day streak</Text>
                </View>
                <View style={styles.progressStats}>
                  <View>
                    <Text style={styles.cardBig}>{todayTasks.length}</Text>
                    <Text style={styles.cardTiny}>due today</Text>
                  </View>
                  <View>
                    <Text style={styles.cardBig}>{overdueTasks.length}</Text>
                    <Text style={styles.cardTiny}>overdue</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Stat tiles */}
          <Animated.View style={[styles.stats, pop]}>
            {stats.map((s) => (
              <View key={s.label} style={styles.tile}>
                <Ionicons name={s.icon} size={18} color={s.tint} />
                <Text style={[styles.tileValue, { color: s.valueColor }]}>{s.value}</Text>
                <Text style={styles.tileLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Overdue (only when there is something overdue) */}
          {overdueTasks.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: '#ff6262' }]}>Overdue</Text>
                <View style={[styles.countPill, styles.countPillRed]}>
                  <Text style={[styles.countText, { color: '#ff6262' }]}>{overdueTasks.length}</Text>
                </View>
              </View>
              {overdueTasks.map((t) => renderTaskCard(t, true))}
            </>
          )}

          {/* Today */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Today’s Tasks</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{todayTasks.length}</Text>
            </View>
          </View>
          {todayTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for today. Add one to get started!</Text>
          ) : (
            todayTasks.map((t) => renderTaskCard(t, false))
          )}

          {/* Upcoming */}
          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Upcoming</Text>
          {upcomingTasks.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming tasks scheduled.</Text>
          ) : (
            upcomingTasks.map((u) => (
              <Pressable key={u.id} onPress={() => toggle(u.id)} style={styles.upCard}>
                <View style={[styles.upDot, { backgroundColor: u.completed ? '#c8c8c8' : u.priority.color }]} />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, u.completed && styles.struck]}>{u.title}</Text>
                  <Text style={styles.code}>{u.dueDate ? `Due ${u.dueDate}` : 'No due date'}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </ResponsiveScreen>

      <Pressable
        style={[styles.fab, { bottom: 80 + insets.bottom }]}
        onPress={() => navigation.navigate('AddTaskScreen')}
      >
        <LinearGradient colors={['#ac4dff', '#c98cfe']} style={styles.fabGradient}>
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 4 }, elevation: 4 };

const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 150 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  date: { fontFamily: font.medium, fontSize: 14, color: t.muted, lineHeight: 22 },
  greeting: { fontFamily: font.bold, fontSize: 24, lineHeight: 36, color: t.text },
  headerIcons: { flexDirection: 'row', gap: 12 },
  bell: { width: 45, height: 44, borderRadius: 15, backgroundColor: 'rgba(229,199,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.bold, fontSize: 20, color: '#fff' },
  cardWrap: { minHeight: 116, marginBottom: 19 },
  card: { minHeight: 116, borderRadius: 22, padding: 14, justifyContent: 'center', ...shadow, shadowOpacity: 0.2 },
  progressContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ringContainer: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  progressInfo: { flex: 1, minWidth: 0 },
  progressStats: { width: 64, gap: 8 },
  cardLabel: { fontFamily: font.semi, fontSize: 13, color: '#fff', marginBottom: 3 },
  cardBig: { fontFamily: font.bold, fontSize: 17, color: '#fff' },
  cardSmall: { fontFamily: font.semi, fontSize: 11, color: '#fff', opacity: 0.86, marginTop: 3 },
  cardTiny: { fontFamily: font.medium, fontSize: 10, color: '#fff', opacity: 0.8 },
  ringCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ringText: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  tile: { flex: 1, minWidth: 0, height: 92, borderRadius: 16, backgroundColor: t.card, paddingHorizontal: 10, justifyContent: 'center', ...shadow, shadowOpacity: 0.12 },
  tileValue: { fontFamily: font.bold, fontSize: 19, color: t.text, lineHeight: 28 },
  tileLabel: { fontFamily: font.semi, fontSize: 12, color: t.muted, opacity: 0.75 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontFamily: font.bold, fontSize: 21, color: t.text },
  countPill: { marginLeft: 'auto', width: 27, height: 20, borderRadius: 19, backgroundColor: t.pill, alignItems: 'center', justifyContent: 'center' },
  countPillRed: { backgroundColor: 'rgba(255,98,98,0.15)' },
  countText: { fontFamily: font.semi, fontSize: 10, color: colors.purple },
  taskCard: { minHeight: 79, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, backgroundColor: t.card, marginBottom: 14, padding: 14, ...shadow },
  check: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  taskContent: { flex: 1, minWidth: 0, gap: 6 },
  taskTitle: { fontFamily: font.semi, fontSize: 14, color: t.text, flexShrink: 1 },
  struck: { textDecorationLine: 'line-through', opacity: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  badge: { height: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: font.bold, fontSize: 12 },
  code: { fontFamily: font.semi, fontSize: 12, color: t.muted, opacity: 0.8 },
  upCard: { minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 13, backgroundColor: t.card, marginTop: 12, paddingHorizontal: 18, paddingVertical: 10, ...shadow },
  upDot: { width: 9, height: 9, borderRadius: 5 },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: t.muted, marginBottom: 12, fontStyle: 'italic' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    ...shadow,
    zIndex: 999,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function useStyles() {
  const { theme } = useTheme();
  return useMemo(() => makeStyles(theme), [theme]);
}
