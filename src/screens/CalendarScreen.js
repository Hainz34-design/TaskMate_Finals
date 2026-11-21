import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ResponsiveScreen from '../components/ResponsiveScreen';
import BackgroundImage from '../components/BackgroundImage';
import { colors, font } from '../theme';

function parseDueDate(value) {
  if (typeof value !== 'string') return null;

  const date = value.trim();
  const monthFirst = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date);
  const yearFirst = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date);
  if (!monthFirst && !yearFirst) return null;

  const year = Number(monthFirst ? monthFirst[3] : yearFirst[1]);
  const month = Number(monthFirst ? monthFirst[1] : yearFirst[2]) - 1;
  const day = Number(monthFirst ? monthFirst[2] : yearFirst[3]);
  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year
    || parsedDate.getMonth() !== month
    || parsedDate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function isTaskOnDate(task, year, month, day) {
  const dueDate = parseDueDate(task.dueDate);
  return dueDate?.year === year && dueDate.month === month && dueDate.day === day;
}

export default function CalendarScreen({ tasks = [], onToggleTask, onDeleteTask }) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(5);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState('1');
  const [weather, setWeather] = useState(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[currentMonthIndex];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=Cavite,PH&units=metric&appid=0f03260387994988cf67ca8a408a3ace'
        );
        const data = await response.json();
        if (response.ok) {
          setWeather({
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            city: data.name,
          });
        }
      } catch (error) {
        console.log('Weather API error:', error);
      }
    };
    fetchWeather();
  }, []);

  const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
  const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }
  while (daysArray.length % 7 !== 0) {
    daysArray.push(null);
  }

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const getTaskDotsForDay = (dayNum) => {
    if (!dayNum) return [];
    const matchingTasks = tasks.filter((task) => isTaskOnDate(
      task,
      currentYear,
      currentMonthIndex,
      dayNum,
    ));

    const colorsList = matchingTasks.map(t => {
      if (t.priority?.label === 'HIGH') return '#ff6262';
      if (t.priority?.label === 'MEDIUM') return '#ffae00';
      return '#4cd964';
    });

    return [...new Set(colorsList)].slice(0, 3);
  };

  const selectedDayTasks = tasks.filter((task) => isTaskOnDate(
    task,
    currentYear,
    currentMonthIndex,
    Number(selectedDate),
  ));

  return (
    <View style={styles.root}>
      <BackgroundImage />
      <ResponsiveScreen>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.subtitle}>View your schedule and{'\n'}never miss a deadline</Text>

          <LinearGradient
            colors={['#ad52f8', '#c97bfa']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.weatherHero}
          >
            <View style={styles.weatherMain}>
              <View style={styles.weatherIconWrap}>
                <Ionicons name="sunny" size={42} color="#ffd84d" />
                <View style={styles.heroCloud}>
                  <Ionicons name="cloud" size={46} color="#fff" />
                </View>
              </View>
              <View style={styles.temperatureBlock}>
                <Text style={styles.weatherTemp}>
                  {weather ? `${weather.temp}°C` : '26°C'}
                </Text>
                <Text style={styles.weatherCity}>{weather ? weather.city : 'Manila'}</Text>
              </View>
              <View style={styles.heroDivider} />
              <Text style={styles.weatherDesc}>Party Cloudy</Text>
            </View>
            <Text style={styles.heroSparkOne}>✦</Text>
            <Text style={styles.heroSparkTwo}>✦</Text>
            <View style={styles.heroCloudRight}>
              <Ionicons name="cloud" size={78} color="#fff" />
            </View>
          </LinearGradient>

          <View style={styles.monthNav}>
            <Pressable style={styles.calNavArrow} onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.calMonthText}>{monthName} {currentYear}</Text>
            <Pressable style={styles.calNavArrow} onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.weekdaysRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd, index) => (
                <Text key={index} style={styles.weekdayText}>{wd}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {daysArray.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const isSelected = String(selectedDate) === String(day);
                const dots = getTaskDotsForDay(day);

                return (
                  <Pressable
                    key={`day-${day}`}
                    style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                    onPress={() => setSelectedDate(String(day))}
                  >
                    <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                    {dots.length > 0 && (
                      <View style={styles.dotRow}>
                        {dots.map((color, dIdx) => (
                          <View key={dIdx} style={[styles.dot, { backgroundColor: color }]} />
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Events</Text>

          {selectedDayTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks scheduled for this day.</Text>
          ) : (
            selectedDayTasks.map((t) => (
              <View key={t.id} style={styles.taskCard}>
                <View style={[styles.leftBar, { backgroundColor: t.priority?.color || colors.purple }]} />
                
                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text style={[styles.taskTitle, t.completed && styles.struck]}>
                    {t.title}
                  </Text>
                  <View style={styles.metaRow}>
                    {t.subject ? (
                      <View style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>{t.subject}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.timeText}>{t.time || '10:30 am'}</Text>
                  </View>
                </View>

                <Pressable 
                  onPress={() => onToggleTask(t.id)} 
                  style={[styles.doneButton, t.completed && styles.doneButtonActive]}
                >
                  <Text style={[styles.doneButtonText, t.completed && styles.doneButtonTextActive]}>
                    {t.completed ? 'Done' : 'Mark Done'}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </ResponsiveScreen>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  headerTitle: { fontFamily: font.bold, fontSize: 32, lineHeight: 40, color: '#0a0a0a' },
  subtitle: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: '#9d9db5', marginTop: 3, marginBottom: 20 },
  weatherHero: {
    width: '100%',
    height: 98,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
  },
  weatherMain: { flexDirection: 'row', alignItems: 'center', height: '100%', paddingHorizontal: 14, zIndex: 2 },
  weatherIconWrap: { width: 54, height: 70, alignItems: 'center', justifyContent: 'center' },
  heroCloud: { position: 'absolute', left: 17, top: 31 },
  temperatureBlock: { width: 76, marginLeft: 3 },
  weatherTemp: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, color: '#fff' },
  weatherCity: { fontFamily: font.medium, fontSize: 14, lineHeight: 16, color: '#fff', marginTop: -2 },
  heroDivider: { width: 1, height: 58, backgroundColor: 'rgba(255,255,255,0.45)', marginRight: 12 },
  weatherDesc: { flex: 1, minWidth: 0, fontFamily: font.semi, fontSize: 14, color: '#fff', zIndex: 3 },
  heroSparkOne: { position: 'absolute', right: 72, top: 12, color: '#fff', fontSize: 18, zIndex: 4 },
  heroSparkTwo: { position: 'absolute', right: 62, top: 29, color: '#fff', fontSize: 11, zIndex: 4 },
  heroCloudRight: { position: 'absolute', right: -21, bottom: -14, zIndex: 1 },
  monthNav: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  calNavArrow: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#c29af9', alignItems: 'center', justifyContent: 'center' },
  calMonthText: { flex: 1, fontFamily: font.bold, fontSize: 20, textAlign: 'center', color: '#0a0a0a' },
  calendarCard: { backgroundColor: '#fff', borderRadius: 32, overflow: 'hidden', ...shadow, marginBottom: 22, paddingBottom: 10 },
  weekdaysRow: { flexDirection: 'row', paddingTop: 18, paddingBottom: 12, paddingHorizontal: 8 },
  weekdayText: { flex: 1, fontFamily: font.bold, fontSize: 13, color: '#111', textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 12 },
  dayCell: { width: '14.2857%', height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 1, borderRadius: 22 },
  selectedDayCell: { backgroundColor: '#b260f4' },
  dayText: { fontFamily: font.bold, fontSize: 16, color: '#111' },
  selectedDayText: { color: '#fff', fontFamily: font.bold },
  dotRow: { flexDirection: 'row', gap: 3, height: 8, marginTop: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: '#0a0a0a', marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, position: 'relative', overflow: 'hidden', ...shadow },
  leftBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  taskTitle: { fontFamily: font.semi, fontSize: 14, color: '#000' },
  struck: { textDecorationLine: 'line-through', opacity: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  subjectBadge: { backgroundColor: 'rgba(172,77,255,0.12)', paddingHorizontal: 8, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  subjectText: { fontFamily: font.bold, fontSize: 10, color: colors.purple },
  timeText: { fontFamily: font.medium, fontSize: 12, color: colors.lightGrey },
  doneButton: { backgroundColor: 'rgba(76,217,100,0.15)', paddingHorizontal: 12, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  doneButtonActive: { backgroundColor: '#4cd964' },
  doneButtonText: { fontFamily: font.bold, fontSize: 11, color: '#2ecc71' },
  doneButtonTextActive: { color: '#fff' },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: colors.lightGrey, textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
});