import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenBackground from '../components/ScreenBackground';
import ResponsiveScreen from '../components/ResponsiveScreen';
import { font } from '../theme';
import { useTheme } from '../ThemeContext';

const COLORS = {
  ink: '#3a1678',
  accent: '#8b3dff',
  muted: '#a995cf',
  line: '#e6dafc',
  danger: '#ff5a5a',
};

const PRIORITIES = [
  { key: 'HIGH', label: 'High', dot: '#ff6b6b', color: '#ff6262', bg: 'rgba(255,98,98,0.12)' },
  { key: 'MEDIUM', label: 'Medium', dot: '#ffd60a', color: '#ffae00', bg: 'rgba(255,174,0,0.12)' },
  { key: 'LOW', label: 'Low', dot: '#4cd964', color: '#4cd964', bg: 'rgba(76,217,100,0.12)' },
];

const CATEGORIES = ['Work', 'School', 'Personal', 'Health', 'Shopping', 'Other'];
const REPEATS = ['None', 'Daily', 'Weekly', 'Monthly'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/* ---------- small building blocks ---------- */

function Label({ children, required }) {
  const styles = useStyles();
  return (
    <Text style={styles.label}>
      {children}
      {required ? <Text style={{ color: COLORS.danger }}> *</Text> : null}
    </Text>
  );
}

function PickerField({ icon, value, placeholder, onPress, open }) {
  const styles = useStyles();
  return (
    <Pressable style={[styles.inputBox, styles.pickerField, open && styles.inputFocused]} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={18} color={COLORS.accent} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.pickerText, !value && { color: COLORS.muted }]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.accent} />
    </Pressable>
  );
}

function Chip({ label, active, onPress, style }) {
  const styles = useStyles();
  return (
    <Pressable style={[styles.chip, active && styles.chipActive, style]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- calendar popup ---------- */

function CalendarModal({ visible, value, onClose, onSelect }) {
  const styles = useStyles();
  const today = new Date();
  const start = value || today;
  const [view, setView] = useState(new Date(start.getFullYear(), start.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const changeMonth = (delta) => setView(new Date(year, month + delta, 1));

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.calHeader}>
            <Pressable onPress={() => changeMonth(-1)} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color={COLORS.accent} />
            </Pressable>
            <Text style={styles.sheetTitle}>
              {MONTHS[month]} {year}
            </Text>
            <Pressable onPress={() => changeMonth(1)} hitSlop={10}>
              <Ionicons name="chevron-forward" size={22} color={COLORS.accent} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((d, i) => (
              <View key={`w${i}`} style={styles.dayCell}>
                <Text style={styles.weekday}>{d}</Text>
              </View>
            ))}
            {cells.map((day, i) => {
              const date = day ? new Date(year, month, day) : null;
              const selected = sameDay(date, value);
              const isToday = sameDay(date, today);
              return (
                <View key={`d${i}`} style={styles.dayCell}>
                  {day ? (
                    <Pressable
                      style={[styles.dayBtn, isToday && !selected && styles.dayBtnToday, selected && styles.dayBtnSelected]}
                      onPress={() => onSelect(date)}
                    >
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={styles.sheetFooter}>
            <Pressable onPress={() => onSelect(new Date())}>
              <Text style={styles.linkText}>Today</Text>
            </Pressable>
            <Pressable onPress={onClose}>
              <Text style={[styles.linkText, { color: COLORS.muted }]}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- time popup ---------- */

function TimeModal({ visible, onClose, onConfirm }) {
  const styles = useStyles();
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>Select time</Text>

          <Text style={styles.sheetLabel}>Hour</Text>
          <View style={styles.chipWrap}>
            {hours.map((h) => (
              <Chip key={h} label={String(h)} active={hour === h} onPress={() => setHour(h)} style={styles.chipSmall} />
            ))}
          </View>

          <Text style={styles.sheetLabel}>Minute</Text>
          <View style={styles.chipWrap}>
            {minutes.map((m) => (
              <Chip key={m} label={pad(m)} active={minute === m} onPress={() => setMinute(m)} style={styles.chipSmall} />
            ))}
          </View>

          <View style={[styles.chipWrap, { marginTop: 14 }]}>
            {['AM', 'PM'].map((p) => (
              <Chip key={p} label={p} active={period === p} onPress={() => setPeriod(p)} style={{ flex: 1 }} />
            ))}
          </View>

          <Pressable style={styles.confirmBtn} onPress={() => onConfirm(`${pad(hour)}:${pad(minute)} ${period}`)}>
            <Text style={styles.confirmText}>Set {pad(hour)}:{pad(minute)} {period}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- main screen ---------- */

export default function AddTaskScreen({ onAddTask }) {
  const styles = useStyles();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [repeat, setRepeat] = useState('None');

  const [showCalendar, setShowCalendar] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [focused, setFocused] = useState(null);
  const [showError, setShowError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const canSave = title.trim().length > 0;
  const focusProps = (name) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  const handleSave = async () => {
    if (saving) return;
    if (!canSave) {
      setShowError(true);
      return;
    }
    const p = PRIORITIES.find((x) => x.key === priority);
    setSaving(true);
    setSaveError('');
    try {
      if (onAddTask) {
        await onAddTask({
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate ? formatDate(dueDate) : '',
          time,
          priority: { label: p.key, color: p.color, bg: p.bg },
          subject: category,
          reminder,
          repeat,
          completed: false,
        });
      }
      navigation.goBack();
    } catch (e) {
      setSaveError(e.message || 'Could not save the task. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <ResponsiveScreen>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Add New Task</Text>
              <Text style={styles.headerSub}>Let’s get things done!</Text>
            </View>
            <LinearGradient colors={['#b45cff', '#7b2ff7']} style={styles.logoBox}>
              <Ionicons name="book" size={22} color="#fff" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Label required>Task title</Label>
          <TextInput
            style={[
              styles.inputBox,
              focused === 'title' && styles.inputFocused,
              showError && !canSave && styles.inputError,
            ]}
            placeholder="Enter task title..."
            placeholderTextColor={COLORS.muted}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (t.trim()) setShowError(false);
            }}
            {...focusProps('title')}
          />
          {showError && !canSave ? <Text style={styles.errorText}>Enter a task title to continue.</Text> : null}

          {/* Description */}
          <Label>Description (optional)</Label>
          <TextInput
            style={[styles.inputBox, styles.textArea, focused === 'desc' && styles.inputFocused]}
            placeholder="Add a description..."
            placeholderTextColor={COLORS.muted}
            multiline
            value={description}
            onChangeText={setDescription}
            {...focusProps('desc')}
          />

          {/* Date + time */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Label>Due date</Label>
              <PickerField
                icon="calendar-outline"
                value={dueDate ? formatDate(dueDate) : ''}
                placeholder="Select date"
                onPress={() => setShowCalendar(true)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label>Time</Label>
              <PickerField
                icon="time-outline"
                value={time}
                placeholder="Select time"
                onPress={() => setShowTime(true)}
              />
            </View>
          </View>

          {/* Priority */}
          <Label>Priority</Label>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const selected = priority === p.key;
              return (
                <Pressable
                  key={p.key}
                  style={[
                    styles.priorityCard,
                    selected && { borderColor: p.color, backgroundColor: p.bg },
                  ]}
                  onPress={() => setPriority(p.key)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.dot }]} />
                  <Text style={[styles.priorityText, selected && { color: p.color, fontFamily: font.bold }]}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Category */}
          <Label>Category</Label>
          <PickerField
            value={category}
            placeholder="Select category"
            open={categoryOpen}
            onPress={() => setCategoryOpen((o) => !o)}
          />
          {categoryOpen ? (
            <View style={styles.dropdown}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(c);
                    setCategoryOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownText, category === c && styles.dropdownTextActive]}>{c}</Text>
                  {category === c ? <Ionicons name="checkmark" size={18} color={COLORS.accent} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}

          {/* More options */}
          <Pressable style={styles.moreHeader} onPress={() => setMoreOpen((o) => !o)}>
            <Text style={styles.moreTitle}>More Options</Text>
            <Ionicons name={moreOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.accent} />
          </Pressable>
          {moreOpen ? (
            <View style={styles.moreBody}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Remind me</Text>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  trackColor={{ false: '#d9c9f2', true: '#b45cff' }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={styles.sheetLabel}>Repeat</Text>
              <View style={styles.chipWrap}>
                {REPEATS.map((r) => (
                  <Chip key={r} label={r} active={repeat === r} onPress={() => setRepeat(r)} />
                ))}
              </View>
            </View>
          ) : null}

          {saveError ? <Text style={[styles.errorText, { marginTop: 16 }]}>{saveError}</Text> : null}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable style={{ flex: 1 }} onPress={handleSave}>
              <LinearGradient
                colors={canSave ? ['#b45cff', '#7b2ff7'] : ['#dccbf5', '#cdb6ee']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Add Task'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </ResponsiveScreen>

      <CalendarModal
        visible={showCalendar}
        value={dueDate}
        onClose={() => setShowCalendar(false)}
        onSelect={(d) => {
          setDueDate(d);
          setShowCalendar(false);
        }}
      />
      <TimeModal
        visible={showTime}
        onClose={() => setShowTime(false)}
        onConfirm={(t) => {
          setTime(t);
          setShowTime(false);
        }}
      />
    </ScreenBackground>
  );
}

/* ---------- styles ---------- */

const shadow = {
  shadowColor: '#7b2ff7',
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
};

const noOutline = Platform.select({ web: { outlineStyle: 'none' }, default: {} });

const makeStyles = (t) => {
  // same names as before, but the colors follow the theme
  const COLORS = { ink: t.ink, accent: '#8b3dff', muted: t.muted, line: t.divider, danger: '#ff5a5a' };
  return StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontFamily: font.bold, fontSize: 26, color: COLORS.ink },
  headerSub: { fontFamily: font.medium, fontSize: 13, color: COLORS.accent, marginTop: 2 },
  logoBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadow },

  label: { fontFamily: font.bold, fontSize: 13, color: COLORS.ink, marginTop: 18, marginBottom: 8 },
  inputBox: {
    backgroundColor: t.card,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    fontFamily: font.medium,
    fontSize: 15,
    color: COLORS.ink,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow,
    ...noOutline,
  },
  inputFocused: { borderColor: COLORS.accent },
  inputError: { borderColor: COLORS.danger },
  errorText: { fontFamily: font.medium, fontSize: 12, color: COLORS.danger, marginTop: 6 },
  textArea: { height: 96, textAlignVertical: 'top', paddingTop: 14 },
  row: { flexDirection: 'row' },

  pickerField: { flexDirection: 'row', alignItems: 'center' },
  pickerText: { flex: 1, fontFamily: font.medium, fontSize: 14, color: COLORS.ink },

  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityCard: {
    flex: 1,
    height: 74,
    backgroundColor: t.card,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow,
  },
  priorityDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#000', marginBottom: 6 },
  priorityText: { fontFamily: font.semi, fontSize: 13, color: COLORS.muted },

  dropdown: { backgroundColor: t.card, borderRadius: 14, marginTop: 8, paddingVertical: 4, ...shadow },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontFamily: font.medium, fontSize: 14, color: COLORS.ink },
  dropdownTextActive: { fontFamily: font.bold, color: COLORS.accent },

  moreHeader: {
    marginTop: 14,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(180,92,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreTitle: { fontFamily: font.semi, fontSize: 14, color: COLORS.ink },
  moreBody: { backgroundColor: t.cardSoft, borderRadius: 14, padding: 16, marginTop: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontFamily: font.medium, fontSize: 14, color: COLORS.ink },

  buttonRow: { flexDirection: 'row', gap: 14, marginTop: 28 },
  cancelButton: { flex: 1, height: 54, backgroundColor: t.card, borderRadius: 999, alignItems: 'center', justifyContent: 'center', ...shadow },
  cancelButtonText: { fontFamily: font.bold, fontSize: 15, color: COLORS.muted },
  saveButton: { height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center', ...shadow },
  saveButtonText: { fontFamily: font.bold, fontSize: 15, color: '#fff' },

  /* modals */
  backdrop: { flex: 1, backgroundColor: 'rgba(40,10,80,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 360, backgroundColor: t.card, borderRadius: 20, padding: 18 },
  sheetTitle: { fontFamily: font.bold, fontSize: 16, color: COLORS.ink, textAlign: 'center' },
  sheetLabel: { fontFamily: font.semi, fontSize: 12, color: COLORS.muted, marginTop: 14, marginBottom: 8 },
  sheetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  linkText: { fontFamily: font.bold, fontSize: 14, color: COLORS.accent },

  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', alignItems: 'center', paddingVertical: 3 },
  weekday: { fontFamily: font.bold, fontSize: 12, color: COLORS.muted },
  dayBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayBtnToday: { borderWidth: 1.5, borderColor: COLORS.accent },
  dayBtnSelected: { backgroundColor: COLORS.accent },
  dayText: { fontFamily: font.medium, fontSize: 14, color: COLORS.ink },
  dayTextSelected: { color: '#fff', fontFamily: font.bold },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, height: 36, borderRadius: 999, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' },
  chipSmall: { width: 48, paddingHorizontal: 0 },
  chipActive: { backgroundColor: COLORS.accent },
  chipText: { fontFamily: font.semi, fontSize: 13, color: COLORS.ink },
  chipTextActive: { color: '#fff' },
  confirmBtn: { marginTop: 18, height: 48, borderRadius: 999, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontFamily: font.bold, fontSize: 15, color: '#fff' },
  });
};

function useStyles() {
  const { theme } = useTheme();
  return useMemo(() => makeStyles(theme), [theme]);
}
