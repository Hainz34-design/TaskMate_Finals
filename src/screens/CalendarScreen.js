import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

export default function CalendarScreen({ tasks = [], onToggleTask, onDeleteTask }) {
  const today = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(String(today.getDate()));
  const [weather, setWeather] = useState(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[currentMonthIndex];

  // Fetch Live Weather API for Cavite
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=Cavite,PH&units=metric&appid=YOUR_OPENWEATHER_API_KEY'
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

  // Precise Calendar Grid Calculation with Trailing Padding
  const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  const daysArray = [];
  // Offset padding for the start of the month
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // All days of the month
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }
  // Trailing padding to complete the final row (ensures uniform 7-column grid alignment)
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

  // Match backend tasks to calendar day indicator dots
  const getTaskDotsForDay = (dayNum) => {
    if (!dayNum) return [];
    const dayStr = String(dayNum);
    const matchingTasks = tasks.filter(t => t.dueDate && t.dueDate.includes(dayStr));
    
    const colorsList = matchingTasks.map(t => {
      if (t.priority?.label === 'HIGH') return '#ff6262';
      if (t.priority?.label === 'MEDIUM') return '#ffae00';
      return '#4cd964';
    });
    return [...new Set(colorsList)].slice(0, 3);
  };

  const selectedDayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return t.dueDate.includes(String(selectedDate));
  });

  return (
    <View style={styles.root}>
      <ScaledCanvas>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.subtitle}>{tasks.length} tasks this month</Text>

          {/* Calendar Widget Card */}
          <View style={styles.calendarCard}>
            <LinearGradient colors={['#ac4dff', '#c98cfe']} style={styles.calHeaderGradient}>
              <Pressable style={styles.calNavArrow} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </Pressable>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.calMonthText}>{monthName}</Text>
                <Text style={styles.calYearText}>{currentYear}</Text>
              </View>
              <Pressable style={styles.calNavArrow} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </Pressable>
            </LinearGradient>

            {/* Weekdays Row */}
            <View style={styles.weekdaysRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd, index) => (
                <Text key={index} style={styles.weekdayText}>{wd}</Text>
              ))}
            </View>

            {/* Days Grid - Perfectly Aligned with Trailing Padding */}
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
                    <View style={styles.dotRow}>
                      {dots.map((color, dIdx) => (
                        <View key={dIdx} style={[styles.dot, { backgroundColor: color }]} />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Priority Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ff6262' }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ffae00' }]} />
              <Text style={styles.legendText}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4cd964' }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
          </View>

          {/* Weather API Card at Bottom of Calendar */}
          <View style={styles.weatherCard}>
            <View style={styles.weatherInfoRow}>
              <Ionicons name="partly-sunny-outline" size={28} color={colors.purple} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.weatherCity}>{weather ? weather.city : 'Cavite, PH'}</Text>
                <Text style={styles.weatherDesc}>{weather ? weather.description : 'Loading live weather...'}</Text>
              </View>
              <Text style={styles.weatherTemp}>{weather ? `${weather.temp}°C` : '--°C'}</Text>
            </View>
          </View>

          {/* Selected Date Tasks Section */}
          <Text style={styles.sectionTitle}>Tasks for {monthName} {selectedDate}</Text>

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
      </ScaledCanvas>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { position: 'absolute', left: 24, top: 40, width: 350, height: 740 },
  headerTitle: { fontFamily: font.bold, fontSize: 32, color: '#000' },
  subtitle: { fontFamily: font.medium, fontSize: 14, color: colors.lightGrey, marginTop: 4, marginBottom: 20 },
  calendarCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', ...shadow, marginBottom: 16 },
  calHeaderGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  calNavArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  calMonthText: { fontFamily: font.bold, fontSize: 18, color: '#fff' },
  calYearText: { fontFamily: font.medium, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  weekdayText: { fontFamily: font.bold, fontSize: 12, color: colors.lightGrey, width: 36, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, justifyContent: 'space-between' },
  dayCell: { width: 42, height: 46, alignItems: 'center', justifyContent: 'center', marginVertical: 4, borderRadius: 12 },
  selectedDayCell: { backgroundColor: colors.purple },
  dayText: { fontFamily: font.semi, fontSize: 14, color: '#000' },
  selectedDayText: { color: '#fff', fontFamily: font.bold },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: font.medium, fontSize: 12, color: colors.lightGrey },
  weatherCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24, ...shadow },
  weatherInfoRow: { flexDirection: 'row', alignItems: 'center' },
  weatherCity: { fontFamily: font.bold, fontSize: 14, color: '#000' },
  weatherDesc: { fontFamily: font.medium, fontSize: 12, color: colors.lightGrey, textTransform: 'capitalize' },
  weatherTemp: { fontFamily: font.bold, fontSize: 18, color: colors.purple },
  sectionTitle: { fontFamily: font.bold, fontSize: 20, color: '#000', marginBottom: 12 },
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