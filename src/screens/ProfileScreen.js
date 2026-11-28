import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import ResponsiveScreen from '../components/ResponsiveScreen';
import ThemedBackground from '../components/ThemedBackground';
import { colors, font } from '../theme';
import { useTheme } from '../ThemeContext';

const INK = '#2b1a6b';

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

function StatCard({ icon, value, label, tint, bubble, wash, suffix = '' }) {
  const styles = useStyles();
  const { theme: t, dark } = useTheme();
  return (
    <LinearGradient colors={dark ? [t.card, t.card] : ['#ffffff', wash]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bubble }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <View style={styles.statText}>
        <Text style={styles.statValue}>{value}{suffix}</Text>
        <Text style={styles.statLabel}>{label}</Text>
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
      <Text style={[styles.rowLabel, danger && { color: '#ff5a6a' }]}>{label}</Text>
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
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={() => {}}>
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
  const monthPrefix = `${String(now.getMonth() + 1).padStart(2, '0')}/`;
  const monthGoals = tasks.filter(
    (t) => t.dueDate && t.dueDate.startsWith(monthPrefix) && t.dueDate.endsWith(`/${now.getFullYear()}`)
  ).length;
  const streak = 0;

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
          <View style={styles.hero}>
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
                  <Text style={styles.badgeText}>Personal Workspace</Text>
                </View>
              </View>
            </View>
          </View>
          {message ? <Text style={styles.error}>{message}</Text> : null}

          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard icon="book-outline" value={completedCount} label="Tasks Completed" tint="#8b3dff" bubble="#efe3ff" wash="#ece0ff" />
            <StatCard icon="radio-button-on" value={completion} suffix="%" label="Completion Rate" tint="#14bd91" bubble="#d9f6ea" wash="#d6f5e8" />
            <StatCard icon="flame-outline" value={streak} label="Current Streak" tint="#ff7b45" bubble="#ffe6da" wash="#ffe3d6" />
            <StatCard icon="calendar-outline" value={monthGoals} label="Month Goals" tint="#4d85ef" bubble="#e0eaff" wash="#dbe7ff" />
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
      <DialogModal
        visible={helpOpen}
        title="Help & Support"
        message="The help center is coming soon."
        onClose={() => setHelpOpen(false)}
        actions={[{ label: 'OK', primary: true, onPress: () => setHelpOpen(false) }]}
      />
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

  hero: { height: 170, borderRadius: 20, overflow: 'hidden', backgroundColor: '#c98cfe', ...shadow },
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
  avatarWrap: { width: 78, height: 78 },
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
  statCard: { width: '48.5%', height: 76, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, ...shadow },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statText: { marginLeft: 10, flex: 1, minWidth: 0 },
  statValue: { fontFamily: font.bold, fontSize: 20, color: t.text, lineHeight: 24 },
  statLabel: { fontFamily: font.medium, fontSize: 10, color: t.muted },

  sectionTitle: { fontFamily: font.bold, fontSize: 20, color: t.heading, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: t.card, borderRadius: 18, paddingHorizontal: 14, ...shadow },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: t.divider },
  bubble: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowLabel: { flex: 1, fontFamily: font.semi, fontSize: 15, color: t.text },

  backdrop: { flex: 1, backgroundColor: 'rgba(40,10,80,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 340, backgroundColor: t.card, borderRadius: 20, padding: 20 },
  dialogTitle: { fontFamily: font.bold, fontSize: 18, color: t.heading, textAlign: 'center' },
  dialogMessage: { fontFamily: font.medium, fontSize: 14, color: t.muted, textAlign: 'center', marginTop: 8 },
  dialogActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  dialogBtn: { flex: 1, height: 46, borderRadius: 999, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' },
  dialogBtnPrimary: { backgroundColor: '#8b3dff' },
  dialogBtnText: { fontFamily: font.bold, fontSize: 14, color: '#8b3dff' },
  dialogBtnTextPrimary: { color: '#fff' },
});

function useStyles() {
  const { theme } = useTheme();
  return useMemo(() => makeStyles(theme), [theme]);
}
