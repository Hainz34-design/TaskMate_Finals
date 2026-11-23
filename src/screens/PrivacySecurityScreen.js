import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ResponsiveScreen from '../components/ResponsiveScreen';
import BackgroundImage from '../components/BackgroundImage';
import { colors, font } from '../theme';

function Row({ icon, label, value, onPress, danger, right, last }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={[styles.row, !last && styles.rowDivider]}>
      <View style={[styles.bubble, danger && { backgroundColor: '#ffd6da' }]}>
        <Ionicons name={icon} size={20} color={danger ? '#ff5a6a' : '#a951f1'} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, danger && { color: '#ff5a6a' }]}>{label}</Text>
        {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
      </View>
      {right}
    </Wrapper>
  );
}

function Toggle({ value, onValueChange }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#d4cdf0', true: '#b45cff' }}
      thumbColor="#fff"
    />
  );
}

export default function PrivacySecurityScreen({ user }) {
  const navigation = useNavigation();
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [loginAlert, setLoginAlert] = useState(false);
  const [notice, setNotice] = useState('');

  const comingSoon = (label) => setNotice(`${label} is coming soon.`);

  return (
    <View style={styles.root}>
      <BackgroundImage />
      <ResponsiveScreen>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.navigate('Profile')} accessibilityLabel="Back to profile">
              <LinearGradient colors={['#b45cff', '#7b2ff7']} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </LinearGradient>
            </Pressable>
            <Text style={styles.title}>Privacy & Security</Text>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <Text style={styles.section}>Account information</Text>
          <View style={styles.card}>
            <Row icon="person-outline" label="Change Name" value={user?.fullName} onPress={() => comingSoon('Changing your name')} />
            <Row icon="mail-outline" label="Change email" value={user?.email} onPress={() => comingSoon('Changing your email')} />
            <Row icon="call-outline" label="Contact Number" value="09XX XXX XXXX" onPress={() => comingSoon('Adding a contact number')} />
            <Row icon="lock-closed-outline" label="Change Password" value="••••••••••" onPress={() => comingSoon('Changing your password')} />
            <Row icon="trash-outline" label="Delete Account" danger onPress={() => comingSoon('Deleting your account')} last />
          </View>

          <Text style={styles.section}>Security</Text>
          <View style={styles.card}>
            <Row icon="shield-outline" label="Two-Factor Authentication" right={<Toggle value={twoFactor} onValueChange={setTwoFactor} />} />
            <Row icon="finger-print-outline" label="Face ID / Fingerprint" right={<Toggle value={biometric} onValueChange={setBiometric} />} />
            <Row icon="notifications-outline" label="Login Notification" right={<Toggle value={loginAlert} onValueChange={setLoginAlert} />} last />
          </View>
        </ScrollView>
      </ResponsiveScreen>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 130 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadow },
  title: { fontFamily: font.bold, fontSize: 22, color: '#111' },
  notice: { fontFamily: font.medium, fontSize: 12, color: '#8b3dff', marginTop: 8 },
  section: { fontFamily: font.bold, fontSize: 18, color: '#7a7a85', marginTop: 22, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 12, ...shadow },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#e9e6f2' },
  bubble: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#efe3ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: font.semi, fontSize: 14, color: '#222' },
  rowValue: { fontFamily: font.regular, fontSize: 11, color: '#9a9aa5', marginTop: 1 },
});
