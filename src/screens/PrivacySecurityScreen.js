import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ResponsiveScreen from '../components/ResponsiveScreen';
import ThemedBackground from '../components/ThemedBackground';
import { font } from '../theme';
import { useTheme } from '../ThemeContext';
import {
  changeEmail,
  changeName,
  changePassword,
  changePhone,
  deleteAccount,
  getAccount,
} from '../services/accountApi';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Row({ icon, label, value, onPress, danger, right, last }) {
  const styles = useStyles();
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

// A popup with a few input boxes. onSubmit(values) should throw an Error to show a message.
function EditModal({ title, message, fields, submitLabel = 'Save', danger, onClose, onSubmit }) {
  const styles = useStyles();
  const { theme: t } = useTheme();
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.initial || ''])));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.dialog}>
          <Text style={[styles.dialogTitle, danger && { color: '#ff4d5e' }]}>{title}</Text>
          {message ? <Text style={styles.dialogMessage}>{message}</Text> : null}

          {fields.map((f) => (
            <View key={f.key}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={values[f.key]}
                onChangeText={(text) => setValues((v) => ({ ...v, [f.key]: text }))}
                placeholder={f.placeholder}
                placeholderTextColor={t.muted}
                secureTextEntry={Boolean(f.secure)}
                keyboardType={f.keyboardType}
                autoCapitalize={f.secure || f.keyboardType === 'email-address' ? 'none' : 'words'}
                autoCorrect={false}
              />
            </View>
          ))}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.dialogActions}>
            <Pressable style={styles.btn} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.btn, danger ? styles.btnDanger : styles.btnPrimary]} onPress={submit}>
              <Text style={styles.btnTextPrimary}>{busy ? 'Please wait...' : submitLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function PrivacySecurityScreen({ user, token, onUserUpdated, onAccountDeleted }) {
  const styles = useStyles();
  const navigation = useNavigation();

  const [phone, setPhone] = useState('');
  const [dialog, setDialog] = useState(null); // 'name' | 'email' | 'phone' | 'password' | 'delete'
  const [notice, setNotice] = useState('');

  // The contact number is saved on the server, so load it when the screen opens
  useEffect(() => {
    if (!token) return;
    getAccount(token)
      .then((a) => setPhone(a.phone || ''))
      .catch(() => {});
  }, [token]);

  const done = (text) => setNotice(text);

  const dialogs = {
    name: {
      title: 'Change Name',
      fields: [{ key: 'fullName', label: 'Full name', initial: user?.fullName || '', placeholder: 'Your full name' }],
      onSubmit: async (v) => {
        const name = v.fullName.trim();
        if (name.length < 2 || name.length > 100) throw new Error('Name must be 2 to 100 characters.');
        const res = await changeName(token, name);
        if (onUserUpdated) onUserUpdated(res.user);
        done('Your name was updated.');
      },
    },
    email: {
      title: 'Change Email',
      message: 'Enter your new email and your current password to confirm.',
      fields: [
        { key: 'email', label: 'New email', initial: user?.email || '', placeholder: 'name@email.com', keyboardType: 'email-address' },
        { key: 'password', label: 'Current password', secure: true, placeholder: 'Your password' },
      ],
      onSubmit: async (v) => {
        const email = v.email.trim().toLowerCase();
        if (!emailPattern.test(email)) throw new Error('Enter a valid email address.');
        if (!v.password) throw new Error('Enter your current password.');
        const res = await changeEmail(token, email, v.password);
        if (onUserUpdated) onUserUpdated(res.user);
        done('Your email was updated.');
      },
    },
    phone: {
      title: 'Contact Number',
      message: 'Optional. Leave it blank to remove your number.',
      fields: [{ key: 'phone', label: 'Contact number', initial: phone, placeholder: '09XX XXX XXXX', keyboardType: 'phone-pad' }],
      submitLabel: 'Save',
      onSubmit: async (v) => {
        const value = v.phone.trim();
        if (value !== '') {
          const digits = value.replace(/\D/g, '');
          if (!/^\+?[0-9\s\-()]{7,20}$/.test(value) || digits.length < 7 || digits.length > 15) {
            throw new Error('Enter a valid contact number.');
          }
        }
        const res = await changePhone(token, value);
        setPhone(res.phone || '');
        done(res.phone ? 'Your contact number was saved.' : 'Your contact number was removed.');
      },
    },
    password: {
      title: 'Change Password',
      fields: [
        { key: 'current', label: 'Current password', secure: true, placeholder: 'Current password' },
        { key: 'next', label: 'New password', secure: true, placeholder: 'At least 8 characters' },
        { key: 'confirm', label: 'Confirm new password', secure: true, placeholder: 'Type it again' },
      ],
      onSubmit: async (v) => {
        if (!v.current) throw new Error('Enter your current password.');
        if (v.next.length < 8) throw new Error('New password must be at least 8 characters.');
        if (v.next.length > 72) throw new Error('New password is too long.');
        if (v.next !== v.confirm) throw new Error('The new passwords do not match.');
        await changePassword(token, v.current, v.next);
        done('Your password was changed.');
      },
    },
    delete: {
      title: 'Delete Account',
      message: 'This permanently deletes your account, your tasks, and your pictures. This cannot be undone. Enter your password to confirm.',
      danger: true,
      submitLabel: 'Delete',
      fields: [{ key: 'password', label: 'Password', secure: true, placeholder: 'Your password' }],
      onSubmit: async (v) => {
        if (!v.password) throw new Error('Enter your password to confirm.');
        await deleteAccount(token, v.password);
        if (onAccountDeleted) onAccountDeleted();
      },
    },
  };

  const active = dialog ? dialogs[dialog] : null;
  const open = (name) => {
    setNotice('');
    setDialog(name);
  };

  return (
    <View style={styles.root}>
      <ThemedBackground />
      <ResponsiveScreen>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.navigate('Profile')} accessibilityLabel="Back to profile">
              <LinearGradient colors={['#b45cff', '#7b2ff7']} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </LinearGradient>
            </Pressable>
            <Text style={styles.title}>My Account</Text>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <Text style={styles.section}>Account information</Text>
          <View style={styles.card}>
            <Row icon="person-outline" label="Change Name" value={user?.fullName} onPress={() => open('name')} />
            <Row icon="mail-outline" label="Change email" value={user?.email} onPress={() => open('email')} />
            <Row icon="call-outline" label="Contact Number" value={phone || 'None'} onPress={() => open('phone')} />
            <Row icon="lock-closed-outline" label="Change Password" value="••••••••••" onPress={() => open('password')} />
            <Row icon="trash-outline" label="Delete Account" danger onPress={() => open('delete')} last />
          </View>

        </ScrollView>
      </ResponsiveScreen>

      {active ? (
        <EditModal
          key={dialog}
          title={active.title}
          message={active.message}
          fields={active.fields}
          submitLabel={active.submitLabel}
          danger={active.danger}
          onClose={() => setDialog(null)}
          onSubmit={active.onSubmit}
        />
      ) : null}
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

const noOutline = Platform.select({ web: { outlineStyle: 'none' }, default: {} });

const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 130 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadow },
  title: { fontFamily: font.bold, fontSize: 22, color: t.text },
  notice: { fontFamily: font.semi, fontSize: 13, color: '#2ecc71', marginTop: 8 },
  section: { fontFamily: font.bold, fontSize: 18, color: t.muted, marginTop: 22, marginBottom: 10 },
  card: { backgroundColor: t.card, borderRadius: 18, paddingHorizontal: 12, ...shadow },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: t.divider },
  bubble: { width: 38, height: 38, borderRadius: 19, backgroundColor: t.bubble, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: font.semi, fontSize: 14, color: t.text },
  rowValue: { fontFamily: font.regular, fontSize: 11, color: '#9a9aa5', marginTop: 1 },

  backdrop: { flex: 1, backgroundColor: 'rgba(40,10,80,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 380, backgroundColor: t.card, borderRadius: 20, padding: 20 },
  dialogTitle: { fontFamily: font.bold, fontSize: 18, color: t.heading, textAlign: 'center' },
  dialogMessage: { fontFamily: font.medium, fontSize: 13, color: t.muted, textAlign: 'center', marginTop: 8 },
  fieldLabel: { fontFamily: font.semi, fontSize: 12, color: t.muted, marginTop: 14, marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: font.medium,
    fontSize: 15,
    color: t.text,
    backgroundColor: t.chip,
    borderWidth: 1.5,
    borderColor: t.divider,
    ...noOutline,
  },
  errorText: { fontFamily: font.medium, fontSize: 12, color: '#ff5a5a', marginTop: 10 },
  dialogActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: { flex: 1, height: 46, borderRadius: 999, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#8b3dff' },
  btnDanger: { backgroundColor: '#ff4d5e' },
  btnText: { fontFamily: font.bold, fontSize: 14, color: '#8b3dff' },
  btnTextPrimary: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
});

function useStyles() {
  const { theme } = useTheme();
  return useMemo(() => makeStyles(theme), [theme]);
}
