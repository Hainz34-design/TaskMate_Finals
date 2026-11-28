import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ResponsiveScreen from '../components/ResponsiveScreen';
import ThemedBackground from '../components/ThemedBackground';
import { colors, font } from '../theme';
import { useTheme } from '../ThemeContext';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '0f03260387994988cf67ca8a408a3ace';
const FALLBACK_CITY = 'Cavite,PH';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const cap = (s = '') => (s ? s[0].toUpperCase() + s.slice(1) : '');

function parseDueDate(value) {
  if (typeof value !== 'string') return null;
  const m1 = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  const m2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
  if (!m1 && !m2) return null;

  const year = Number(m1 ? m1[3] : m2[1]);
  const month = Number(m1 ? m1[1] : m2[2]) - 1;
  const day = Number(m1 ? m1[2] : m2[3]);
  const d = new Date(year, month, day);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    ? { year, month, day }
    : null;
}

const isTaskOnDate = (task, y, m, d) => {
  const due = parseDueDate(task.dueDate);
  return due?.year === y && due.month === m && due.day === d;
};

const getIcon = (main = '', desc = '') => {
  const m = main.toLowerCase();
  const d = desc.toLowerCase();
  if (m.includes('thunder')) return 'thunderstorm';
  if (m.includes('drizzle') || m.includes('rain') || d.includes('rain') || d.includes('drizzle')) return 'rainy';
  if (m.includes('clear')) return 'sunny';
  if (d.includes('few clouds') || d.includes('scattered')) return 'partly-sunny';
  return m.includes('cloud') ? 'cloud' : 'partly-sunny';
};

const formatHour = (dtSec, idx) => {
  if (!idx) return 'Now';
  const h = new Date(dtSec * 1000).getHours();
  return `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`;
};

const buildDaily = (list) => {
  const groups = new Map();
  list.forEach((item) => {
    const dt = new Date(item.dt * 1000);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  return Array.from(groups.entries()).slice(0, 7).map(([key, entries], idx) => {
    const tempsMin = entries.map((e) => e.main?.temp_min).filter((n) => typeof n === 'number');
    const tempsMax = entries.map((e) => e.main?.temp_max).filter((n) => typeof n === 'number');
    const maxPop = Math.max(0, ...entries.map((e) => (typeof e.pop === 'number' ? Math.round(e.pop * 100) : 0)));
    const mid = entries.find((e) => new Date(e.dt * 1000).getHours() === 12) || entries[Math.floor(entries.length / 2)] || entries[0];
    const w = mid?.weather?.[0] || {};
    const [, m, day] = key.split('-').map(Number);

    return {
      key,
      label: idx === 0 ? 'Today' : `${SHORT_MONTHS[m - 1]} ${day}`,
      condition: cap(w.main || w.description || 'Clear'),
      icon: getIcon(w.main, w.description),
      min: tempsMin.length ? Math.round(Math.min(...tempsMin)) : null,
      max: tempsMax.length ? Math.round(Math.max(...tempsMax)) : null,
      pop: maxPop,
    };
  });
};

const weatherUrl = (endpoint, coords) => {
  const base = `https://api.openweathermap.org/data/2.5/${endpoint}?units=metric&appid=${encodeURIComponent(API_KEY)}`;
  return coords ? `${base}&lat=${coords.latitude}&lon=${coords.longitude}` : `${base}&q=${encodeURIComponent(FALLBACK_CITY)}`;
};

export default function CalendarScreen({ tasks = [], onToggleTask }) {
  const styles = useStyles();
  const { dark } = useTheme();

  const now = new Date();
  const [monthIdx, setMonthIdx] = useState(() => now.getMonth());
  const [year, setYear] = useState(() => now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(() => String(now.getDate()));

  const [coords, setCoords] = useState(null);
  const [placeLabel, setPlaceLabel] = useState(null);
  const [locReady, setLocReady] = useState(false);

  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState('loading');
  const [forecastList, setForecastList] = useState([]);
  const [forecastStatus, setForecastStatus] = useState('idle');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (!active) return;
          const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCoords(next);
          try {
            const [g] = await Location.reverseGeocodeAsync(next);
            const name = [g?.city || g?.subregion || g?.district, g?.region].filter(Boolean).join(', ');
            if (active && name) setPlaceLabel(name);
          } catch { }
        }
      } catch { }
      finally { if (active) setLocReady(true); }
    })();
    return () => { active = false; };
  }, []);

  const loadWeather = useCallback(async (signal) => {
    setWeatherStatus('loading');
    try {
      const res = await fetch(weatherUrl('weather', coords), { signal });
      const data = await res.json();
      if (!res.ok || typeof data?.main?.temp !== 'number') throw new Error();
      if (!signal?.aborted) {
        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: typeof data.main.feels_like === 'number' ? Math.round(data.main.feels_like) : null,
          min: typeof data.main.temp_min === 'number' ? Math.round(data.main.temp_min) : null,
          max: typeof data.main.temp_max === 'number' ? Math.round(data.main.temp_max) : null,
          wind: typeof data.wind?.speed === 'number' ? Math.round(data.wind.speed * 3.6) : null,
          description: cap(data.weather?.[0]?.description),
          main: data.weather?.[0]?.main || '',
          city: placeLabel || data.name || FALLBACK_CITY,
        });
        setWeatherStatus('success');
      }
    } catch {
      if (!signal?.aborted) { setWeather(null); setWeatherStatus('error'); }
    }
  }, [coords, placeLabel]);

  const loadForecast = useCallback(async (signal) => {
    setForecastStatus('loading');
    try {
      const res = await fetch(weatherUrl('forecast', coords), { signal });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data?.list)) throw new Error();
      if (!signal?.aborted) { setForecastList(data.list); setForecastStatus('success'); }
    } catch {
      if (!signal?.aborted) { setForecastList([]); setForecastStatus('error'); }
    }
  }, [coords]);

  useEffect(() => {
    if (!locReady) return;
    const ctrl = new AbortController();
    loadWeather(ctrl.signal);
    return () => ctrl.abort();
  }, [locReady, loadWeather]);

  useEffect(() => {
    if (!modalOpen || !locReady) return;
    const ctrl = new AbortController();
    if (weatherStatus !== 'success') loadWeather(ctrl.signal);
    loadForecast(ctrl.signal);
    return () => ctrl.abort();
  }, [modalOpen, locReady, weatherStatus, loadWeather, loadForecast]);

  const hourly = useMemo(
    () => forecastList.slice(0, 8).map((item, idx) => {
      const w = item.weather?.[0] || {};
      return {
        key: `${item.dt}-${idx}`,
        label: formatHour(item.dt, idx),
        temp: typeof item.main?.temp === 'number' ? Math.round(item.main.temp) : null,
        icon: getIcon(w.main, w.description),
      };
    }),
    [forecastList]
  );

  const daily = useMemo(() => buildDaily(forecastList), [forecastList]);

  const firstDay = new Date(year, monthIdx, 1).getDay();
  const totalDays = new Date(year, monthIdx + 1, 0).getDate();
  const daysArray = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  while (daysArray.length % 7) daysArray.push(null);

  useEffect(() => {
    if (Number(selectedDay) > totalDays) setSelectedDay(String(totalDays));
  }, [totalDays, selectedDay]);

  const shiftMonth = (delta) => {
    const next = monthIdx + delta;
    if (next < 0) { setMonthIdx(11); setYear((y) => y - 1); }
    else if (next > 11) { setMonthIdx(0); setYear((y) => y + 1); }
    else setMonthIdx(next);
  };

  const getDots = (dayNum) => {
    if (!dayNum) return [];
    const cols = tasks
      .filter((t) => isTaskOnDate(t, year, monthIdx, dayNum))
      .map((t) => (t.priority?.label === 'HIGH' ? '#ff6262' : t.priority?.label === 'MEDIUM' ? '#ffae00' : '#4cd964'));
    return [...new Set(cols)].slice(0, 3);
  };

  const dayTasks = tasks.filter((t) => isTaskOnDate(t, year, monthIdx, Number(selectedDay)));
  const locationText = weather?.city || placeLabel || FALLBACK_CITY;
  const isOk = weatherStatus === 'success' && weather;

  return (
    <View style={styles.root}>
      <ThemedBackground />
      <ResponsiveScreen>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.subtitle}>View your schedule and{'\n'}never miss a deadline</Text>

          <Pressable onPress={() => setModalOpen(true)} style={({ pressed }) => pressed && { opacity: 0.94 }}>
            <LinearGradient colors={['#ad52f8', '#c97bfa']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.weatherHero}>
              <View style={styles.weatherMain}>
                <View style={styles.weatherIconWrap}>
                  <Ionicons name="sunny" size={42} color="#ffd84d" />
                  <Ionicons name="cloud" size={46} color="#fff" style={styles.heroCloud} />
                </View>
                <View style={styles.tempBlock}>
                  <Text style={styles.weatherTemp}>{isOk ? `${weather.temp}°C` : '--°'}</Text>
                  <Text style={styles.weatherCity} numberOfLines={1}>{isOk ? weather.city : weatherStatus === 'loading' ? 'Locating...' : 'Unavailable'}</Text>
                </View>
                <View style={styles.heroDivider} />
                <Text style={styles.weatherDesc} numberOfLines={2}>
                  {isOk ? weather.description : weatherStatus === 'error' ? 'API error · Tap to retry' : 'Fetching live weather...'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.85)" />
              </View>
              <Text style={styles.sparkOne}>✦</Text>
              <Text style={styles.sparkTwo}>✦</Text>
              <Ionicons name="cloud" size={78} color="#fff" style={styles.heroCloudRight} />
            </LinearGradient>
          </Pressable>

          <View style={styles.monthNav}>
            <Pressable style={styles.calNavArrow} onPress={() => shiftMonth(-1)}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.calMonthText}>{MONTHS[monthIdx]} {year}</Text>
            <Pressable style={styles.calNavArrow} onPress={() => shiftMonth(1)}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((wd) => <Text key={wd} style={styles.weekdayText}>{wd}</Text>)}
            </View>
            <View style={styles.daysGrid}>
              {daysArray.map((day, i) => {
                if (!day) return <View key={`e-${i}`} style={styles.dayCell} />;
                const active = String(selectedDay) === String(day);
                const dots = getDots(day);
                return (
                  <Pressable key={`d-${day}`} style={[styles.dayCell, active && styles.selectedDayCell]} onPress={() => setSelectedDay(String(day))}>
                    <Text style={[styles.dayText, active && styles.selectedDayText]}>{day}</Text>
                    {dots.length > 0 && (
                      <View style={styles.dotRow}>
                        {dots.map((c, idx) => <View key={idx} style={[styles.dot, { backgroundColor: c }]} />)}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Events · {MONTHS[monthIdx]} {selectedDay}, {year}</Text>

          {dayTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks scheduled for this day.</Text>
          ) : (
            dayTasks.map((t) => (
              <View key={t.id} style={styles.taskCard}>
                <View style={[styles.leftBar, { backgroundColor: t.priority?.color || colors.purple }]} />
                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text style={[styles.taskTitle, t.completed && styles.struck]}>{t.title}</Text>
                  <View style={styles.metaRow}>
                    {t.subject ? <View style={styles.subjectBadge}><Text style={styles.subjectText}>{t.subject}</Text></View> : null}
                    <Text style={styles.timeText}>{t.time || '10:30 am'}</Text>
                  </View>
                </View>
                <Pressable onPress={() => onToggleTask(t.id)} style={[styles.doneButton, t.completed && styles.doneButtonActive]}>
                  <Text style={[styles.doneButtonText, t.completed && styles.doneButtonTextActive]}>{t.completed ? 'Done' : 'Mark Done'}</Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </ResponsiveScreen>

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <LinearGradient
            colors={dark ? ['#2a1456', '#3a1c78', '#4b2593'] : ['#ad52f8', '#b260f4', '#c97bfa']}
            style={styles.modalSheet}
          >
            <View style={styles.modalTopBar}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={18} color="#fff" />
                <Text style={styles.modalCity} numberOfLines={1}>{locationText}</Text>
              </View>
              <Pressable onPress={() => setModalOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </View>

            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              <View style={styles.modalHero}>
                <Text style={styles.modalTemp}>{isOk ? `${weather.temp}°` : '--°'}</Text>
                <Text style={styles.modalCond}>
                  {isOk
                    ? `${cap(weather.main || weather.description)}${weather.min !== null && weather.max !== null ? `  ${weather.min}° / ${weather.max}°` : ''}`
                    : weatherStatus === 'loading' ? 'Loading weather...' : 'Weather unavailable'}
                </Text>
                {isOk && (
                  <Text style={styles.modalMeta}>
                    {weather.feelsLike !== null ? `Feels like ${weather.feelsLike}°` : ''}
                    {weather.wind !== null ? `  Wind ${weather.wind} km/h` : ''}
                  </Text>
                )}
              </View>

              <View style={styles.panel}>
                <View style={styles.panelHead}>
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text style={styles.panelTitle}>Next 24 Hours</Text>
                </View>
                {forecastStatus === 'loading' ? (
                  <ActivityIndicator color="#fff" style={{ paddingVertical: 14 }} />
                ) : forecastStatus === 'error' || !hourly.length ? (
                  <Pressable onPress={() => loadForecast()}><Text style={styles.panelEmpty}>Couldn&apos;t load hourly forecast · Tap to retry</Text></Pressable>
                ) : (
                  <ScrollView horizontal nestedScrollEnabled scrollEnabled directionalLockEnabled bounces={false} showsHorizontalScrollIndicator={false} style={{ width: '100%' }} contentContainerStyle={styles.hourlyRow}>
                    {hourly.map((s, idx) => (
                      <View key={s.key} style={[styles.hourlyItem, idx === hourly.length - 1 && { marginRight: 0 }]}>
                        <Text style={styles.hourlyTime}>{s.label}</Text>
                        <Ionicons name={s.icon} size={24} color={s.icon.includes('sunny') ? '#ffd84d' : '#fff'} />
                        <Text style={styles.hourlyTemp}>{s.temp !== null ? `${s.temp}°` : '--°'}</Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.panel}>
                <View style={styles.panelHead}>
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                  <Text style={styles.panelTitle}>Next 7 Days</Text>
                </View>
                {forecastStatus === 'loading' ? (
                  <ActivityIndicator color="#fff" style={{ paddingVertical: 14 }} />
                ) : forecastStatus === 'error' || !daily.length ? (
                  <Pressable onPress={() => loadForecast()}><Text style={styles.panelEmpty}>Couldn&apos;t load daily forecast · Tap to retry</Text></Pressable>
                ) : (
                  daily.map((d, i) => (
                    <View key={d.key} style={[styles.dailyRow, i < daily.length - 1 && styles.dailyBorder]}>
                      <Text style={styles.dailyLabel}>{d.label}</Text>
                      <View style={styles.dailyIcon}>
                        <Ionicons name={d.icon} size={20} color={d.icon.includes('sunny') ? '#ffd84d' : '#fff'} />
                        {d.pop > 0 && <Text style={styles.popText}>{d.pop}%</Text>}
                      </View>
                      <Text style={styles.dailyCond} numberOfLines={1}>{d.condition}</Text>
                      <Text style={styles.dailyRange}>{d.min !== null && d.max !== null ? `${d.min}° / ${d.max}°` : '--°'}</Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 };

// Styles are built from the current theme (light or dark)
const makeStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  headerTitle: { fontFamily: font.bold, fontSize: 32, lineHeight: 40, color: t.text },
  subtitle: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: t.muted, marginTop: 3, marginBottom: 20 },
  weatherHero: { width: '100%', height: 98, borderRadius: 28, overflow: 'hidden', marginBottom: 20 },
  weatherMain: { flexDirection: 'row', alignItems: 'center', height: '100%', paddingHorizontal: 14, zIndex: 2 },
  weatherIconWrap: { width: 54, height: 70, alignItems: 'center', justifyContent: 'center' },
  heroCloud: { position: 'absolute', left: 17, top: 31 },
  tempBlock: { width: 92, marginLeft: 3 },
  weatherTemp: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, color: '#fff' },
  weatherCity: { fontFamily: font.medium, fontSize: 13, lineHeight: 16, color: '#fff', marginTop: -2 },
  heroDivider: { width: 1, height: 58, backgroundColor: 'rgba(255,255,255,0.45)', marginRight: 12 },
  weatherDesc: { flex: 1, minWidth: 0, fontFamily: font.semi, fontSize: 14, color: '#fff', zIndex: 3 },
  sparkOne: { position: 'absolute', right: 72, top: 12, color: '#fff', fontSize: 18, zIndex: 4 },
  sparkTwo: { position: 'absolute', right: 62, top: 29, color: '#fff', fontSize: 11, zIndex: 4 },
  heroCloudRight: { position: 'absolute', right: -21, bottom: -14, zIndex: 1 },
  monthNav: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  calNavArrow: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#c29af9', alignItems: 'center', justifyContent: 'center' },
  calMonthText: { flex: 1, fontFamily: font.bold, fontSize: 20, textAlign: 'center', color: t.text },
  calendarCard: { backgroundColor: t.card, borderRadius: 32, overflow: 'hidden', ...shadow, marginBottom: 22, paddingBottom: 10 },
  weekdaysRow: { flexDirection: 'row', paddingTop: 18, paddingBottom: 12, paddingHorizontal: 8 },
  weekdayText: { flex: 1, fontFamily: font.bold, fontSize: 13, color: t.text, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 12 },
  dayCell: { width: '14.2857%', height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 1, borderRadius: 22 },
  selectedDayCell: { backgroundColor: '#b260f4' },
  dayText: { fontFamily: font.bold, fontSize: 16, color: t.text },
  selectedDayText: { color: '#fff' },
  dotRow: { flexDirection: 'row', gap: 3, height: 8, marginTop: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: t.text, marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, borderRadius: 16, padding: 16, marginBottom: 14, position: 'relative', overflow: 'hidden', ...shadow },
  leftBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  taskTitle: { fontFamily: font.semi, fontSize: 14, color: t.text },
  struck: { textDecorationLine: 'line-through', opacity: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  subjectBadge: { backgroundColor: 'rgba(172,77,255,0.12)', paddingHorizontal: 8, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  subjectText: { fontFamily: font.bold, fontSize: 10, color: colors.purple },
  timeText: { fontFamily: font.medium, fontSize: 12, color: t.muted },
  doneButton: { backgroundColor: 'rgba(76,217,100,0.15)', paddingHorizontal: 12, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  doneButtonActive: { backgroundColor: '#4cd964' },
  doneButtonText: { fontFamily: font.bold, fontSize: 11, color: '#2ecc71' },
  doneButtonTextActive: { color: '#fff' },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: t.muted, textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(18,6,36,0.45)', justifyContent: 'flex-end' },
  modalSheet: { width: '100%', maxWidth: 560, alignSelf: 'center', maxHeight: '90%', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 20, paddingHorizontal: 18 },
  modalTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  locationRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 10 },
  modalCity: { flex: 1, fontFamily: font.bold, fontSize: 20, color: '#fff' },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  modalHero: { alignItems: 'center', paddingVertical: 16, marginBottom: 14 },
  modalTemp: { fontFamily: font.bold, fontSize: 64, lineHeight: 72, color: '#fff' },
  modalCond: { fontFamily: font.semi, fontSize: 17, color: '#fff', marginTop: 4 },
  modalMeta: { fontFamily: font.medium, fontSize: 13, color: 'rgba(255,255,255,0.88)', marginTop: 6 },
  panel: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 24, padding: 16, marginBottom: 14 },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  panelTitle: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  panelEmpty: { fontFamily: font.medium, fontSize: 13, color: 'rgba(255,255,255,0.9)', paddingVertical: 8 },
  hourlyRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 6 },
  hourlyItem: { width: 64, flexShrink: 0, marginRight: 12, paddingVertical: 10, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', gap: 8 },
  hourlyTime: { fontFamily: font.semi, fontSize: 12, color: '#fff' },
  hourlyTemp: { fontFamily: font.bold, fontSize: 15, color: '#fff' },
  dailyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  dailyBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.25)' },
  dailyLabel: { width: 76, fontFamily: font.semi, fontSize: 14, color: '#fff' },
  dailyIcon: { width: 50, flexDirection: 'row', alignItems: 'center', gap: 4 },
  popText: { fontFamily: font.bold, fontSize: 10, color: '#ffe885' },
  dailyCond: { flex: 1, fontFamily: font.medium, fontSize: 14, color: 'rgba(255,255,255,0.95)', paddingHorizontal: 8 },
  dailyRange: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
});

function useStyles() {
  const { theme } = useTheme();
  return useMemo(() => makeStyles(theme), [theme]);
}
