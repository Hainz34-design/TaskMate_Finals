import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

const book = require('../../assets/book.svg');

function Field({ top, label, labelTop, icon, placeholder, value, onChangeText, secure, keyboardType }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Text style={[styles.label, { top: labelTop }]}>{label}</Text>
      <View style={[styles.input, { top }]}>
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
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10} style={styles.eye}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#acacac" />
          </Pressable>
        )}
      </View>
    </>
  );
}

const Divider = ({ top }) => (
  <>
    <View style={[styles.line, { left: 31, top: top + 9 }]} />
    <Text style={[styles.or, { top }]}>or continue with</Text>
    <View style={[styles.line, { left: 262, top: top + 9 }]} />
  </>
);

const Socials = ({ top, onPress }) => (
  <>
    <Pressable style={[styles.social, { left: 31, top }]} onPress={onPress}>
      <Text style={styles.socialText}>Google</Text>
    </Pressable>
    <Pressable style={[styles.social, { left: 210, top }]} onPress={onPress}>
      <Text style={styles.socialText}>Apple</Text>
    </Pressable>
  </>
);

export default function SignupScreen({ onCreateAccount, onGoToLogin }) {
  const intro = useRef(new Animated.Value(0)).current;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const shapeY = intro.interpolate({ inputRange: [0, 1], outputRange: [-263, 0] });
  const logoY = intro.interpolate({ inputRange: [0, 1], outputRange: [-230, 0] });
  const formOpacity = intro.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.root}>
      <ScaledCanvas>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateY: shapeY }] }]}>
          <View style={styles.headerWhite} />
          <View style={styles.headerBite} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateY: logoY }] }]}>
          <Image source={book} contentFit="contain" style={styles.book} />
          <View style={styles.logo}>
            <Text style={[styles.logoText, { color: '#000' }]}>Task</Text>
            <Text style={[styles.logoText, { color: colors.purple }]}>Mate</Text>
          </View>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, { opacity: formOpacity }]}>
          <View style={styles.toggle} />
          <View style={[styles.toggleActive, { left: 203 }]} />
          <Pressable style={[styles.toggleHit, { left: 38 }]} onPress={onGoToLogin}>
            <Text style={[styles.toggleText, { color: '#b9b9b9' }]}>Log In</Text>
          </Pressable>
          <View style={[styles.toggleHit, { left: 203 }]}>
            <Text style={[styles.toggleText, { color: '#fff' }]}>Sign Up</Text>
          </View>

          <Field label="FULL NAME" labelTop={370} top={400} icon="person-outline" placeholder="Full Name" value={fullName} onChangeText={setFullName} />
          <Field label="EMAIL ADDRESS" labelTop={458} top={486} icon="mail-outline" placeholder="Example@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field label="PASSWORD" labelTop={542} top={571} icon="lock-closed-outline" placeholder="•••••••" value={password} onChangeText={setPassword} secure />
          <Pressable style={[styles.primary, { top: 651 }]} onPress={onCreateAccount}>
            <Text style={styles.primaryText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
          <Divider top={727} />
          <Socials top={762} onPress={onCreateAccount} />
        </Animated.View>
      </ScaledCanvas>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.purple },
  headerWhite: { position: 'absolute', left: -26, top: -58, width: 456, height: 329, backgroundColor: '#fff' },
  headerBite: { position: 'absolute', left: 201 - 1020, top: 245, width: 2040, height: 2040, borderRadius: 1020, backgroundColor: colors.purple },
  book: { position: 'absolute', left: 145, top: 79, width: 119, height: 96 },
  logo: { position: 'absolute', left: 112, top: 177, flexDirection: 'row' },
  logoText: { fontFamily: font.bold, fontSize: 36, lineHeight: 54 },
  toggle: { position: 'absolute', left: 33, top: 289, width: 337, height: 52, borderRadius: 34, backgroundColor: '#fff' },
  toggleActive: { position: 'absolute', top: 294, width: 162, height: 42, borderRadius: 28, backgroundColor: 'rgba(161,91,222,0.59)' },
  toggleHit: { position: 'absolute', top: 289, width: 162, height: 52, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontFamily: font.semi, fontSize: 20 },
  label: { position: 'absolute', left: 38, fontFamily: font.semi, fontSize: 16, color: '#fff' },
  input: { position: 'absolute', left: 31, width: 338, height: 48, borderRadius: 16, backgroundColor: '#f5e9ff', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 16 },
  inputText: { marginLeft: 55, marginRight: 46, height: 48, padding: 0, fontFamily: font.semi, fontSize: 12, color: '#444' },
  eye: { position: 'absolute', right: 15 },
  primary: { position: 'absolute', left: 31, width: 341, height: 59, borderRadius: 15, backgroundColor: colors.darkPurple, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { fontFamily: font.bold, fontSize: 20, color: '#fff' },
  line: { position: 'absolute', width: 110, height: 1, backgroundColor: 'rgba(235,229,229,0.85)' },
  or: { position: 'absolute', left: 152, fontFamily: font.semi, fontSize: 12, color: '#ebe5e5' },
  social: { position: 'absolute', width: 162, height: 49, borderRadius: 16, backgroundColor: '#f8f7ff', borderWidth: 1, borderColor: '#754d98', alignItems: 'center', justifyContent: 'center' },
  socialText: { fontFamily: font.semi, fontSize: 16, color: '#000' },
});
