import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveScreen from '../components/ResponsiveScreen';
import BackgroundImage from '../components/BackgroundImage';
import { colors, font } from '../theme';

function StatCard({ icon, value, label, tint, bubble, suffix = '' }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bubble }]}>
        <Ionicons name={icon} size={25} color={tint} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={styles.statValue}>{value}{suffix}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ tasks = [], onLogout, user }) {
  const completedCount = tasks.filter((task) => task.completed).length;
  const subjectCount = new Set(tasks.map((task) => task.subject).filter(Boolean)).size;
  const completion = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const displayName = user?.fullName?.trim() || 'Louise';
  const displayEmail = user?.email?.trim() || 'louise@louise.edu.ph';

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogout },
    ]);
  };

  const showSettings = () => {
    Alert.alert('Profile Settings', 'Choose an option', [
      { text: 'Log out', style: 'destructive', onPress: confirmLogout },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.root}>
      <BackgroundImage />
      <ResponsiveScreen>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>Your personal space <Ionicons name="heart-outline" size={12} color={colors.purple} /></Text>
            </View>
            <Pressable style={styles.settingsButton} onPress={showSettings} accessibilityRole="button" accessibilityLabel="Profile settings">
              <Ionicons name="settings-outline" size={21} color="#a951f1" />
            </Pressable>
          </View>

          <View style={styles.heroWrap}>
            <LinearGradient
              colors={['#96c8f5', '#bcdcf7', '#79afe8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.sun} />
              <View style={[styles.cloud, styles.cloudOne]} />
              <View style={[styles.cloud, styles.cloudTwo]} />
              <View style={[styles.cloud, styles.cloudThree]} />
              <View style={styles.mountainBack} />
              <View style={styles.mountainFront} />
              <View style={styles.castle}>
                <View style={[styles.tower, styles.towerLeft]} />
                <View style={[styles.tower, styles.towerRight]} />
                <View style={styles.castleCenter} />
              </View>
              <LinearGradient
                colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.38)', 'rgba(255,255,255,0)']}
                style={styles.heroShade}
              />
            </LinearGradient>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={42} color="#a66ce8" />
                <Pressable style={styles.editButton} accessibilityRole="button" accessibilityLabel="Edit profile">
                  <Ionicons name="pencil" size={12} color="#fff" />
                </Pressable>
              </View>
              <View style={styles.profileText}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.email}>{displayEmail}</Text>
                <View style={styles.badge}>
                  <Ionicons name="star" size={12} color="#7d5fc8" />
                  <Text style={styles.badgeText}>Personal Workspace</Text>
                </View>
              </View>
            </View>
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

          <View style={styles.statsGrid}>
            <StatCard icon="checkmark-done" value={completedCount} label="Tasks Completed" tint="#ad55ff" bubble="#f0e5ff" />
            <StatCard icon="flag" value={completion} label="Completion Rate" tint="#14bd91" bubble="#dff9ed" suffix="%" />
            <StatCard icon="flame" value={0} label="Current Streak" tint="#ff7b45" bubble="#ffe8df" />
            <StatCard icon="calendar-clear" value={subjectCount} label="Monthly Goals" tint="#4d85ef" bubble="#e3edff" />
          </View>
        </ScrollView>
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { flex: 1 },
  scrollContent: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 17, paddingTop: 24, paddingBottom: 110 },
  headerRow: { height: 66, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontFamily: font.bold, fontSize: 26, lineHeight: 31, color: '#171365' },
  subtitle: { marginTop: 3, fontFamily: font.regular, fontSize: 12, color: '#5966a1' },
  settingsButton: {
    width: 46,
    height: 46,
    marginTop: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#fff',
  },
  heroWrap: {
    height: 192,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  hero: { position: 'absolute', left: 0, right: 0, top: 0, height: 122, overflow: 'hidden' },
  heroShade: { ...StyleSheet.absoluteFillObject },
  sun: { position: 'absolute', right: 28, top: 18, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,248,183,0.85)' },
  cloud: { position: 'absolute', width: 86, height: 22, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.78)' },
  cloudOne: { left: 12, top: 27 },
  cloudTwo: { right: 38, top: 55 },
  cloudThree: { left: 118, top: 70, width: 64, opacity: 0.7 },
  mountainBack: { position: 'absolute', right: -25, bottom: -38, width: 210, height: 150, borderRadius: 70, backgroundColor: '#7da6d6', transform: [{ rotate: '32deg' }] },
  mountainFront: { position: 'absolute', right: 0, bottom: -70, width: 170, height: 150, borderRadius: 75, backgroundColor: '#638dc4', transform: [{ rotate: '-24deg' }] },
  castle: { position: 'absolute', right: 49, bottom: 12, width: 58, height: 76 },
  tower: { position: 'absolute', bottom: 0, width: 20, height: 58, borderRadius: 3, backgroundColor: '#728db1' },
  towerLeft: { left: 0 },
  towerRight: { right: 0 },
  castleCenter: { position: 'absolute', left: 15, bottom: 0, width: 28, height: 72, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: '#809abd' },
  profileRow: {
    position: 'absolute',
    left: 17,
    right: 17,
    bottom: 14,
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee7ff',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#6757b9',
  },
  profileText: { marginLeft: 17, justifyContent: 'center' },
  profileName: { fontFamily: font.bold, fontSize: 18, lineHeight: 22, color: '#17171e' },
  email: { marginTop: 1, fontFamily: font.regular, fontSize: 10, color: '#8a8a91' },
  badge: {
    height: 24,
    marginTop: 7,
    paddingHorizontal: 9,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 7,
    backgroundColor: '#efeaff',
  },
  badgeText: { fontFamily: font.semi, fontSize: 9, color: '#5f55aa' },
  completionCard: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completionTitle: { fontFamily: font.semi, fontSize: 14, color: '#17171e' },
  completionPercent: { fontFamily: font.bold, fontSize: 14, color: colors.purple },
  progressTrack: { height: 8, marginTop: 10, borderRadius: 5, backgroundColor: '#eee8ff', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: colors.purple },
  completionCaption: { marginTop: 6, fontFamily: font.regular, fontSize: 10, color: '#9998a1' },
  statsGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  statCard: {
    width: '48.5%',
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  statTextWrap: { marginLeft: 10 },
  statValue: { fontFamily: font.bold, fontSize: 18, lineHeight: 21, color: '#17171e' },
  statLabel: { marginTop: 2, fontFamily: font.regular, fontSize: 9, lineHeight: 12, color: '#9998a1' },
});
