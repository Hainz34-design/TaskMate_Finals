import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

function StatCard({ icon, value, label, tint, bubble }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconSlot}>
        <View style={[styles.statIcon, { backgroundColor: bubble }]}>
          <Ionicons name={icon} size={25} color={tint} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ToggleRow({ icon, label, value, onValueChange, tint = colors.purple }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={21} color={tint} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d5d0ee', true: '#c38aff' }}
        thumbColor="#fff"
        ios_backgroundColor="#d5d0ee"
        accessibilityLabel={label}
      />
    </View>
  );
}

function LinkRow({ icon, label, onPress, tint = colors.purple }) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress} accessibilityRole="button">
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={21} color={tint} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#b9b9b9" />
    </Pressable>
  );
}

export default function ProfileScreen({ tasks = [], onLogout }) {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [studyReminders, setStudyReminders] = useState(false);
  const completedCount = tasks.filter((task) => task.completed).length;
  const subjectCount = new Set(tasks.map((task) => task.subject).filter(Boolean)).size;
  const completion = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const showComingSoon = (feature) => {
    Alert.alert(feature, 'This feature is not available yet.');
  };

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScaledCanvas>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Profile</Text>

          <View style={styles.heroWrap}>
            <LinearGradient
              colors={[colors.purple, '#c98cfe', colors.darkPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View pointerEvents="none" style={styles.heroGlowTop} />
              <View pointerEvents="none" style={styles.heroGlowBottom} />
              <View style={styles.heroContent}>
                <View style={styles.initialBox}>
                  <Text style={styles.initial}>L</Text>
                </View>
                <Text style={styles.profileName}>Personal</Text>
                <Text style={styles.email}>Example@gmail.com</Text>
                <View style={styles.courseBadge}>
                  <Text style={styles.courseText}>CVSU · Information Technology</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statsRow}>
            <StatCard icon="book-outline" value={completedCount} label={'Tasks\nDone'} tint="#744cff" bubble="#e5ddff" />
            <StatCard icon="flame-outline" value={0} label={'Days\nStreak'} tint="#ff7a32" bubble="#fff0d6" />
            <StatCard icon="locate-outline" value={subjectCount} label="Subjects" tint="#00c978" bubble="#ddfbe8" />
            <StatCard icon="ribbon-outline" value={0} label={'Month\nGoals'} tint="#f03e4f" bubble="#ffe2e2" />
          </View>

          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Overall Completion</Text>
              <Text style={styles.completionPercent}>{completion}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completion}%` }]} />
            </View>
            <Text style={styles.completionCaption}>
              {completedCount} of {tasks.length} tasks completed
            </Text>
          </View>

          <Text style={styles.settingsTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <ToggleRow
              icon="notifications-outline"
              label="Push Notification"
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <View style={styles.separator} />
            <ToggleRow
              icon="moon-outline"
              label="Dark Mode"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <View style={styles.separator} />
            <ToggleRow
              icon="radio-outline"
              label="Study Reminders"
              value={studyReminders}
              onValueChange={setStudyReminders}
            />
            <View style={styles.separator} />
            <LinkRow
              icon="shield-outline"
              label="Privacy and Security"
              onPress={() => showComingSoon('Privacy and Security')}
              tint="#4acb74"
            />
            <View style={styles.separator} />
            <LinkRow
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => showComingSoon('Help & Support')}
              tint="#f5b700"
            />
            <View style={styles.separator} />
            <Pressable style={styles.settingRow} onPress={confirmLogout} accessibilityRole="button">
              <View style={[styles.settingIcon, styles.logoutIcon]}>
                <Ionicons name="log-out-outline" size={21} color="#ff5555" />
              </View>
              <Text style={styles.logoutLabel}>Log out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScaledCanvas>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { position: 'absolute', left: 12, top: 35, width: 378, height: 740 },
  scrollContent: { paddingBottom: 120 },
  title: { fontFamily: font.bold, fontSize: 28, color: '#111', marginBottom: 15 },
  heroWrap: {
    height: 266,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  hero: { flex: 1, borderRadius: 22, overflow: 'hidden' },
  heroGlowTop: {
    position: 'absolute',
    top: -60,
    right: -25,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroGlowBottom: {
    position: 'absolute',
    left: -52,
    bottom: -96,
    width: 250,
    height: 190,
    borderRadius: 125,
    backgroundColor: 'rgba(83,0,158,0.16)',
  },
  heroContent: { ...StyleSheet.absoluteFillObject, alignItems: 'center', paddingTop: 31 },
  initialBox: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  initial: { fontFamily: font.regular, fontSize: 58, color: '#fff', lineHeight: 70 },
  profileName: { marginTop: 5, fontFamily: font.bold, fontSize: 30, color: '#fff', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 5 },
  email: { marginTop: 1, fontFamily: font.regular, fontSize: 12, color: '#fff', textShadowColor: 'rgba(0,0,0,0.55)', textShadowRadius: 4 },
  courseBadge: { marginTop: 12, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(236,245,248,0.68)' },
  courseText: { fontFamily: font.semi, fontSize: 11, color: '#fff' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 },
  statCard: {
    width: 86,
    height: 136,
    alignItems: 'center',
    paddingTop: 12,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  statIconSlot: { width: 50, height: 52, alignItems: 'center', justifyContent: 'center' },
  statIcon: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 25 },
  statValue: { height: 25, marginTop: 4, fontFamily: font.bold, fontSize: 19, lineHeight: 24, color: '#111' },
  statLabel: { height: 30, marginTop: 1, fontFamily: font.regular, fontSize: 11, lineHeight: 15, textAlign: 'center', textAlignVertical: 'top', color: colors.grey },
  completionCard: {
    marginTop: 17,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completionTitle: { fontFamily: font.semi, fontSize: 14, color: '#111' },
  completionPercent: { fontFamily: font.bold, fontSize: 14, color: colors.purple },
  progressTrack: { height: 9, marginTop: 10, borderRadius: 6, backgroundColor: '#eee8ff', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6, backgroundColor: colors.purple },
  completionCaption: { marginTop: 6, fontFamily: font.regular, fontSize: 11, color: colors.grey },
  settingsTitle: { marginTop: 25, marginBottom: 7, fontFamily: font.bold, fontSize: 17, letterSpacing: 1.2, color: '#999' },
  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  settingRow: { minHeight: 59, flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#f0dcff' },
  settingLabel: { flex: 1, marginLeft: 12, fontFamily: font.medium, fontSize: 14, color: '#151515' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#d9d9d9' },
  logoutIcon: { backgroundColor: '#ffe1e1' },
  logoutLabel: { marginLeft: 12, fontFamily: font.medium, fontSize: 14, color: '#ff5555' },
});
