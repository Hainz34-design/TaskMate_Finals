import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveScreen from '../components/ResponsiveScreen';
import BackgroundImage from '../components/BackgroundImage';
import { colors, font } from '../theme';

const book = require('../../assets/Vector book.png');

function Field({ label, icon, placeholder, value, onChangeText, secure, keyboardType }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.input}>
        <Ionicons name={icon} size={18} color="#acacac" style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#acacac"
          secureTextEntry={secure && !visible}
          autoCapitalize="none"
          keyboardType={keyboardType}
          style={styles.inputText}
        />
        {secure && (
          <Pressable onPress={() => setVisible((current) => !current)} hitSlop={10}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#acacac" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function SignupScreen({ onCreateAccount, onGoToLogin }) {
  const [intro] = useState(() => new Animated.Value(0));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [intro]);

  const submitRegistration = async () => {
    if (submitting) return;

    setErrorMessage('');
    setSubmitting(true);
    try {
      await onCreateAccount(fullName, email, password);
    } catch (error) {
      setErrorMessage(error.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showSocialUnavailable = () => {
    Alert.alert('Not available yet', 'Google and Apple sign-in are not connected yet.');
  };

  return (
    <View style={styles.root}>
      <BackgroundImage />
      <View pointerEvents="none" style={styles.purpleWash} />
      <View pointerEvents="none" style={styles.headerWhite} />
      <ResponsiveScreen>
        <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.brandArea, { transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }] }]}>
              <Image source={book} contentFit="contain" style={styles.book} />
              <View style={styles.wordmark}>
                <Text style={styles.logoText}>Task</Text>
                <Text style={[styles.logoText, styles.logoMate]}>Mate</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.form, { opacity: intro }]}>
              <View style={styles.toggle}>
                <Pressable style={styles.toggleOption} onPress={onGoToLogin} accessibilityRole="button">
                  <Text style={styles.toggleText}>Log In</Text>
                </Pressable>
                <View style={styles.toggleActive}>
                  <Text style={styles.toggleActiveText}>Sign Up</Text>
                </View>
              </View>

              <Field
                label="FULL NAME"
                icon="person-outline"
                placeholder="Full Name"
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  setErrorMessage('');
                }}
              />
              <Field
                label="EMAIL ADDRESS"
                icon="mail-outline"
                placeholder="Example@gmail.com"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setErrorMessage('');
                }}
                keyboardType="email-address"
              />
              <Field
                label="PASSWORD"
                icon="lock-closed-outline"
                placeholder="•••••••"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setErrorMessage('');
                }}
                secure
              />

              {errorMessage ? <Text style={styles.error} accessibilityRole="alert">{errorMessage}</Text> : null}

              <Pressable style={[styles.primary, submitting && styles.disabled]} onPress={submitRegistration} disabled={submitting}>
                <Text style={styles.primaryText}>{submitting ? 'Creating account...' : 'Create Account'}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', backgroundColor: colors.purple },
  purpleWash: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(172,77,255,0.92)' },
  headerWhite: { position: 'absolute', top: -40, left: -30, right: -30, height: '38%', borderBottomLeftRadius: 220, borderBottomRightRadius: 220, backgroundColor: '#fff' },
  keyboardArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 464, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingTop: 16, paddingBottom: 24 },
  brandArea: { alignItems: 'center', marginBottom: 24 },
  book: { width: 112, height: 96 },
  wordmark: { flexDirection: 'row', marginTop: -4 },
  logoText: { fontFamily: font.bold, fontSize: 36, lineHeight: 48, color: '#000' },
  logoMate: { color: colors.purple },
  form: { width: '100%' },
  toggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 28, padding: 5, marginBottom: 24 },
  toggleActive: { flex: 1, minHeight: 42, borderRadius: 24, backgroundColor: 'rgba(161,91,222,0.72)', alignItems: 'center', justifyContent: 'center' },
  toggleOption: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  toggleActiveText: { fontFamily: font.semi, fontSize: 16, color: '#fff' },
  toggleText: { fontFamily: font.semi, fontSize: 16, color: '#b9b9b9' },
  fieldGroup: { marginBottom: 15 },
  label: { fontFamily: font.semi, fontSize: 14, color: '#fff', marginBottom: 8 },
  input: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderRadius: 14, backgroundColor: '#f5e9ff', paddingHorizontal: 14 },
  inputIcon: { marginRight: 12 },
  inputText: { flex: 1, minWidth: 0, minHeight: 48, paddingVertical: 0, fontFamily: font.semi, fontSize: 13, color: '#444' },
  error: { fontFamily: font.semi, fontSize: 12, lineHeight: 17, textAlign: 'center', color: '#fff', marginBottom: 10 },
  primary: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: colors.darkPurple },
  primaryText: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
  disabled: { opacity: 0.65 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(235,229,229,0.85)' },
  dividerText: { fontFamily: font.semi, fontSize: 12, color: '#ebe5e5' },
  socialRow: { flexDirection: 'row', gap: 16 },
  social: { flex: 1, minHeight: 48, borderRadius: 15, backgroundColor: '#f8f7ff', borderWidth: 1, borderColor: '#754d98', alignItems: 'center', justifyContent: 'center' },
  socialText: { fontFamily: font.semi, fontSize: 16, color: '#000' },
});
