import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import ResponsiveScreen from '../components/ResponsiveScreen';
import ThemedBackground from '../components/ThemedBackground';
import { colors, font } from '../theme';
import { useTheme } from '../ThemeContext';

const FAQS = [
  {
    q: 'How does TaskMate help me stay organized?',
    a: 'TaskMate groups your tasks into Overdue, Today’s Tasks, and Upcoming while tracking weekly progress, completion rate, and streaks so you can stay on top of your schedule.',
  },
  {
    q: 'How do Task Reminders work?',
    a: 'Toggle Task Reminders on in Settings and allow notifications on your device. TaskMate syncs reminders with your tasks so deadlines are easier to catch.',
  },
  {
    q: 'What happens to a task if I miss its due date?',
    a: 'Unfinished tasks past their due date automatically move into Overdue so nothing slips through the cracks, and you can check them off anytime.',
  },
  {
    q: 'How do I add or update my profile picture and cover?',
    a: 'Tap your profile photo or the "Edit cover" button on your Profile card to pick an image from your gallery and update your look.',
  },
  {
    q: 'Can I switch between Light and Dark Mode?',
    a: 'Yes—use the Dark Mode switch under Settings anytime to adapt colors for indoor or low-light study sessions.',
  },
];

function parseDueDate(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  const mSlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (mSlash) {
    const year = Number(mSlash[3]);
    const month = Number(mSlash[1]) - 1;
    const day = Number(mSlash[2]);
    const d = new Date(year, month, day);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day ? d : null;
  }

  const mIsoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (mIsoDate) {
    const year = Number(mIsoDate[1]);
    const month = Number(mIsoDate[2]) - 1;
    const day = Number(mIsoDate[3]);
    const d = new Date(year, month, day);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day ? d : null;
  }

  const dt = new Date(trimmed);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

// Opens the photo library, shrinks the photo, and returns a small base64 data URL
async function pickImage(kind) {
  const isAvatar = kind === 'avatar';
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: isAvatar ? [1, 1] : [16, 9],
    quality: 1,
  });
  if (result.canceled || !result.assets?.length) return null;

  const context = ImageManipulator.manipulate(result.assets[0].uri);
  context.resize({ width: isAvatar ? 400 : 900 });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });
  return `data:image/jpeg;base64,${saved.base64}`;
}

function StatCard({ icon, value, label, tint, bubble, wash, suffix = '', cardWidth }) {
  const styles = useStyles();
  const { theme: t, dark } = useTheme();
  return (
    <LinearGradient
      colors={dark ? [t.card, t.card] : ['#ffffff', wash]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.statCard, cardWidth ? { width: cardWidth } : null]}
    >
      <View style={[styles.statIcon, { backgroundColor: bubble }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <View style={styles.statText}>
        <Text style={styles.statValue} numberOfLines={1}>{value}{suffix}</Text>
        <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      </View>
    </LinearGradient>
  );
}

function Row({ icon, label, right, onPress, danger, tint = '#a951f1', bubble, last }) {
  const styles = useStyles();
  const { theme: t } = useTheme();
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={[styles.row, !last && styles.rowDivider]}>
      <View style={[styles.bubble, { backgroundColor: bubble || t.bubble }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: '#ff5a6a' }]} numberOfLines={1}>{label}</Text>
      {right}
    </Wrapper>
  );
}

function Toggle({ value, onValueChange }) {
  const { dark } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: dark ? '#4a3b73' : '#d4cdf0', true: '#b45cff' }}
      thumbColor="#fff"
      activeThumbColor="#fff"
    />
  );
}

function DialogModal({ visible, title, message, onClose, actions }) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.dialog, { maxWidth: Math.min(360, width - 36) }]} onPress={() => {}}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            {actions.map((a) => (
              <Pressable
                key={a.label}
                style={[styles.dialogBtn, a.primary && styles.dialogBtnPrimary]}
                onPress={a.onPress}
              >
                <Text style={[styles.dialogBtnText, a.primary && styles.dialogBtnTextPrimary]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function HelpSupportModal({ visible, onClose }) {
  const styles = useStyles();
  const { width, height } = useWindowDimensions();
  const [openIdx, setOpenIdx] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIdx((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.supportSheet,
            {
              maxWidth: Math.min(480, width - 32),
              maxHeight: Math.round(height * 0.82),
            },
          ]}
          onPress={() => {}}
        >
          <View style={styles.supportHeader}>
            <Text style={styles.dialogTitle}>About & Help</Text>
            <Pressable onPress={onClose} style={styles.closeIconBtn} accessibilityLabel="Close help">
              <Ionicons name="close" size={20} color={styles.closeIconColor.color} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.supportBody}>
            <View style={styles.aboutBox}>
              <View style={styles.aboutBadgeRow}>
                <Ionicons name="sparkles" size={16} color="#8b3dff" />
                <Text style={styles.aboutHeading}>About TaskMate</Text>
              </View>
              <Text style={styles.aboutText}>
                TaskMate is built around task management and staying organized on your schedule. Plan
                daily priorities, track upcoming deadlines and weekly momentum, and keep your routine
                clear without clutter.
              </Text>
            </View>

            <Text style={styles.faqHeading}>Frequently Asked Questions</Text>
            {FAQS.map((item, idx) => {
              const expanded = openIdx === idx;
              return (
                <View key={item.q} style={styles.faqCard}>
                  <Pressable onPress={() => toggleFaq(idx)} style={styles.faqQuestionRow}>
                    <Text style={styles.faqQuestion}>{item.q}</Text>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={styles.faqChevronColor.color}
                    />
                  </Pressable>
                  {expanded && <Text style={styles.faqAnswer}>{item.a}</Text>}
                </View>
              );
            })}
          </ScrollView>

          <Pressable style={[styles.dialogBtn, styles.dialogBtnPrimary, styles.supportDoneBtn]} onPress={onClose}>
            <Text style={[styles.dialogBtnText, styles.dialogBtnTextPrimary]}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ProfileScreen({
  tasks = [],
  onLogout,
  user,
  profileImages = {},
  onChangeImage,
  pushEnabled = false,
  onTogglePush,
}) {
  const styles = useStyles();
  const { dark, setDark } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const displayName = user?.fullName?.trim() || 'User';
  const displayEmail = user?.email?.trim() || '';
  const initial = displayName.charAt(0).toUpperCase();

  const completedCount = tasks.filter((t) => t.completed).length;
  const completion = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthGoals = tasks.filter((t) => {
    const parsed = parseDueDate(t.dueDate);
    return parsed && parsed.getMonth() === currentMonth && parsed.getFullYear() === currentYear;
  }).length;
  const streak = 0;

  // Responsive card width inside the 560px max container
  const innerWidth = Math.min(width, 560) - 40;
  const isCompact = innerWidth < 340;
  const statCardWidth = isCompact ? '100%' : (innerWidth - 12) / 2;
  const heroHeight = innerWidth < 360 ? 184 : 170;

  const changeImage = async (kind) => {
    if (busy) return;
    setMessage('');
    setBusy(kind);
    try {
      const dataUri = await pickImage(kind);
      if (dataUri && onChangeImage) await onChangeImage(kind, dataUri);
    } catch (e) {
      setMessage(e.message || 'Could not update the picture. Try again.');
    } finally {
      setBusy('');
    }
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <View style={styles.root}>
      <ThemedBackground />
      <ResponsiveScreen>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Your personal space <Ionicons name="heart-outline" size={12} color={colors.purple} />
          </Text>

          {/* Cover + avatar */}
          <View style={[styles.hero, { height: heroHeight }]}>
            {profileImages.cover ? (
              <Image source={{ uri: profileImages.cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <LinearGradient colors={['#8e6bff', '#c98cfe', '#79afe8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            )}
            <LinearGradient
              colors={['rgba(20,8,60,0)', 'rgba(20,8,60,0.72)']}
              locations={[0.3, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            <Pressable style={styles.editCover} onPress={() => changeImage('cover')}>
              <Ionicons name="pencil" size={11} color="#fff" />
              <Text style={styles.editCoverText}>{busy === 'cover' ? 'Saving...' : 'Edit cover'}</Text>
            </Pressable>

            <View style={styles.profileRow}>
              <Pressable style={styles.avatarWrap} onPress={() => changeImage('avatar')} accessibilityLabel="Change profile picture">
                <View style={styles.avatar}>
                  {profileImages.avatar ? (
                    <Image source={{ uri: profileImages.avatar }} style={styles.avatarImage} resizeMode="cover" />
                  ) : (
                    <Text style={styles.avatarLetter}>{initial}</Text>
                  )}
                </View>
                <View style={styles.pencil}>
                  <Ionicons name={busy === 'avatar' ? 'hourglass-outline' : 'pencil'} size={11} color="#fff" />
                </View>
              </Pressable>

              <View style={styles.profileText}>
                <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.email} numberOfLines={1}>{displayEmail}</Text>
                <View style={styles.badge}>
                  <Ionicons name="star" size={11} color="#7d5fc8" />
                  <Text style={styles.badgeText} numberOfLines={1}>Personal Workspace</Text>
                </View>
              </View>
            </View>
          </View>
          {message ? <Text style={styles.error}>{message}</Text> : null}

          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard icon="book-outline" value={completedCount} label="Tasks Completed" tint="#8b3dff" bubble="#efe3ff" wash="#ece0ff" cardWidth={statCardWidth} />
            <StatCard icon="radio-button-on" value={completion} suffix="%" label="Completion Rate" tint="#14bd91" bubble="#d9f6ea" wash="#d6f5e8" cardWidth={statCardWidth} />
            <StatCard icon="flame-outline" value={streak} label="Current Streak" tint="#ff7b45" bubble="#ffe6da" wash="#ffe3d6" cardWidth={statCardWidth} />
            <StatCard icon="calendar-outline" value={monthGoals} label="Month Goals" tint="#4d85ef" bubble="#e0eaff" wash="#dbe7ff" cardWidth={statCardWidth} />
          </View>

          {/* Settings */}
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <Row icon="notifications-outline" label="Task Reminders" right={<Toggle value={pushEnabled} onValueChange={(v) => onTogglePush && onTogglePush(v)} />} />
            <Row icon="moon-outline" label="Dark Mode" right={<Toggle value={dark} onValueChange={setDark} />} />
            <Row
              icon="person-circle-outline"
              label="My Account"
              tint="#a951f1"
              onPress={() => navigation.navigate('PrivacySecurity')}
              right={<Ionicons name="chevron-forward" size={20} color="#9a9aa5" />}
            />
            <Row
              icon="help-circle-outline"
              label="Help & Support"
              tint="#ffae00"
              onPress={() => setHelpOpen(true)}
              right={<Ionicons name="chevron-forward" size={20} color="#9a9aa5" />}
            />
            <Row icon="log-out-outline" label="Log out" danger tint="#ff5a6a" bubble="#ffd6da" onPress={() => setLogoutOpen(true)} last />
          </View>
        </ScrollView>
      </ResponsiveScreen>

      <DialogModal
        visible={logoutOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        onClose={() => setLogoutOpen(false)}
        actions={[
          { label: 'Cancel', onPress: () => setLogoutOpen(false) },
          { label: 'Log out', primary: true, onPress: confirmLogout },
        ]}
      />
      <HelpSupportModal visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </View>
  );
}

const shadow = {
  shadowColor: '#7b2ff7',
  shadowOpacity: 0.14,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
};

const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 130 },
  title: { fontFamily: font.bold, fontSize: 28, color: t.heading },
  subtitle: { fontFamily: font.regular, fontSize: 12, color: t.muted, marginTop: 2, marginBottom: 16 },

  hero: { minHeight: 170, borderRadius: 20, overflow: 'hidden', backgroundColor: '#c98cfe', ...shadow },
  editCover: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  editCoverText: { fontFamily: font.semi, fontSize: 11, color: '#fff' },
  profileRow: { position: 'absolute', left: 14, right: 14, bottom: 12, flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 78, height: 78, flexShrink: 0 },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#efe7ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: { fontFamily: font.bold, fontSize: 36, color: '#8b3dff' },
  pencil: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#6757b9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { flex: 1, marginLeft: 14, minWidth: 0 },
  name: { fontFamily: font.bold, fontSize: 20, color: '#fff' },
  email: { fontFamily: font.regular, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#efeaff',
    marginTop: 7,
  },
  badgeText: { fontFamily: font.semi, fontSize: 10, color: '#5f55aa' },
  error: { fontFamily: font.medium, fontSize: 12, color: '#ff5a5a', marginTop: 8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 16 },
  statCard: { minHeight: 76, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, ...shadow },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statText: { marginLeft: 10, flex: 1, minWidth: 0 },
  statValue: { fontFamily: font.bold, fontSize: 20, color: t.text, lineHeight: 24 },
  statLabel: { fontFamily: font.medium, fontSize: 10, color: t.muted },

  sectionTitle: { fontFamily: font.bold, fontSize: 20, color: t.heading, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: t.card, borderRadius: 18, paddingHorizontal: 14, ...shadow },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: t.divider },
  bubble: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 2, flexShrink: 0 },
  rowLabel: { flex: 1, fontFamily: font.semi, fontSize: 15, color: t.text, minWidth: 0 },

  backdrop: { flex: 1, backgroundColor: 'rgba(40,10,80,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  dialog: { width: '100%', backgroundColor: t.card, borderRadius: 20, padding: 20 },
  dialogTitle: { fontFamily: font.bold, fontSize: 18, color: t.heading },
  dialogMessage: { fontFamily: font.medium, fontSize: 14, color: t.muted, marginTop: 8, lineHeight: 20 },
  dialogActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  dialogBtn: { flex: 1, minHeight: 46, borderRadius: 999, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  dialogBtnPrimary: { backgroundColor: '#8b3dff' },
  dialogBtnText: { fontFamily: font.bold, fontSize: 14, color: '#8b3dff' },
  dialogBtnTextPrimary: { color: '#fff' },

  supportSheet: { width: '100%', backgroundColor: t.card, borderRadius: 22, padding: 20 },
  supportHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  closeIconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' },
  closeIconColor: { color: t.heading },
  supportBody: { paddingBottom: 8 },
  aboutBox: { backgroundColor: t.chip, borderRadius: 16, padding: 14, marginBottom: 16 },
  aboutBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aboutHeading: { fontFamily: font.bold, fontSize: 14, color: t.heading },
  aboutText: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: t.text },
  faqHeading: { fontFamily: font.bold, fontSize: 14, color: t.heading, marginBottom: 10 },
  faqCard: { borderWidth: 1, borderColor: t.divider, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  faqQuestion: { flex: 1, fontFamily: font.semi, fontSize: 13, lineHeight: 18, color: t.text },
  faqChevronColor: { color: t.muted },
  faqAnswer: { fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: t.muted, marginTop: 8 },
  supportDoneBtn: { flex: 0, marginTop: 10 },
});

function useStyles() {
  const { theme } = useTheme();
  return useMemo(() => makeStyles(theme), [theme]);
}