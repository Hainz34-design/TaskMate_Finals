import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './theme';

const DARK_KEY = 'taskmate_dark_mode';

// Light = your current look. Dark = the same layout with dark surfaces.
export const lightTheme = {
  bg: colors.screenBg,
  card: '#ffffff',
  cardSoft: 'rgba(255,255,255,0.7)',
  text: '#000000',
  muted: colors.lightGrey,
  heading: '#2b1a6b',
  ink: '#3a1678',
  divider: '#e9e6f2',
  pill: 'rgba(229,199,255,0.75)',
  chip: '#f1e8ff',
  bubble: '#efe3ff',
  tabBar: '#ffffff',
  overlay: 'transparent',
};

export const darkTheme = {
  bg: '#120a26',
  card: '#1f1538',
  cardSoft: 'rgba(255,255,255,0.06)',
  text: '#f4edff',
  muted: '#a99fc7',
  heading: '#e6d9ff',
  ink: '#e6d9ff',
  divider: '#34264f',
  pill: 'rgba(172,77,255,0.28)',
  chip: '#2f2150',
  bubble: '#35255a',
  tabBar: '#1a1030',
  overlay: 'rgba(14,8,30,0.88)',
};

const ThemeContext = createContext({
  dark: false,
  theme: lightTheme,
  setDark: () => {},
});

export function ThemeProvider({ children }) {
  const [dark, setDarkState] = useState(false);

  // Load the saved choice when the app opens
  useEffect(() => {
    AsyncStorage.getItem(DARK_KEY)
      .then((v) => {
        if (v === '1') setDarkState(true);
      })
      .catch(() => {});
  }, []);

  const setDark = (value) => {
    setDarkState(value);
    AsyncStorage.setItem(DARK_KEY, value ? '1' : '0').catch(() => {});
  };

  const value = useMemo(
    () => ({ dark, setDark, theme: dark ? darkTheme : lightTheme }),
    [dark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
