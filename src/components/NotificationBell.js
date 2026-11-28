import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, font } from '../theme';
import { useTheme } from '../ThemeContext';

const KIND = {
  overdue: { icon: 'alert-circle-outline', color: '#ff6262', bg: 'rgba(255,98,98,0.12)' },
  today: { icon: 'time-outline', color: '#ffae00', bg: 'rgba(255,174,0,0.14)' },
  tomorrow: { icon: 'calendar-outline', color: '#2f6bff', bg: 'rgba(47,107,255,0.12)' },
};

function parseDue(task) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(task.dueDate || '');
  return m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : null;
}

// Notifications are made from your unfinished tasks: overdue, due today, due tomorrow
function buildNotifications(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const list = [];
  tasks.forEach((t) => {
    if (t.completed) return;
    const d = parseDue(t);
    if (!d) return;
    if (d < today) {
      list.push({ id: `overdue:${t.id}`, kind: 'overdue', order: 0, title: t.title, text: `Overdue · was due ${t.dueDate}` });
    } else if (d.getTime() === today.getTime()) {
      list.push({ id: `today:${t.id}`, kind: 'today', order: 1, title: t.title, text: t.time ? `Due today at ${t.time}` : 'Due today' });
    } else if (d.getTime() === tomorrow.getTime()) {
      list.push({ id: `tomorrow:${t.id}`, kind: 'tomorrow', order: 2, title: t.title, text: t.time ? `Due tomorrow at ${t.time}` : 'Due tomorrow' });
    }
  });
  return list.sort((a, b) => a.order - b.order);
}

export default function NotificationBell({ tasks = [], userId, enabled = true }) {
  const styles = useStyles();
  const storageKey = `taskmate_seen_${userId || 'guest'}`;
  const [seen, setSeen] = useState(null); // null = still loading
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState([]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (active) setSeen(raw ? JSON.parse(raw) : []);
      })
      .catch(() => {
        if (active) setSeen([]);
      });
    return () => {
      active = false;
    };
  }, [storageKey]);

  const notifications = buildNotifications(tasks);
  const unread = seen === null ? [] : notifications.filter((n) => !seen.includes(n.id));

  const openPanel = () => {
    setHighlight(unread.map((n) => n.id));
    setOpen(true);
    // Opening the list marks everything as read, so the red dot goes away
    const ids = notifications.map((n) => n.id);
    setSeen(ids);
    AsyncStorage.setItem(storageKey, JSON.stringify(ids)).catch(() => {});
  };

  return (
    <>
      <Pressable style={styles.bell} onPress={openPanel} accessibilityLabel="Notifications">
        <Ionicons name="notifications-outline" size={24} color={colors.purple} />
        {enabled && unread.length > 0 ? <View style={styles.dot} /> : null}
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Notifications</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color="#6b6b80" />
              </Pressable>
            </View>

            {!enabled ? (
              <Text style={styles.offNote}>
                Notifications are off. Turn on Task Reminders in Profile to get alerts.
              </Text>
            ) : null}

            {notifications.length === 0 ? (
              <Text style={styles.empty}>You’re all caught up. No reminders right now.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {notifications.map((n) => {
                  const k = KIND[n.kind];
                  return (
                    <View key={n.id} style={[styles.item, highlight.includes(n.id) && styles.itemNew]}>
                      <View style={[styles.iconBubble, { backgroundColor: k.bg }]}>
                        <Ionicons name={k.icon} size={22} color={k.color} />
                      </View>
                      <View style={styles.itemText}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{n.title}</Text>
                        <Text style={[styles.itemSub, { color: k.color }]}>{n.text}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const makeStyles = (t) => StyleSheet.create({
  bell: {
    width: 45,
    height: 44,
    borderRadius: 15,
    backgroundColor: t.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 7,
    right: 9,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
    borderWidth: 2,
    borderColor: t.bg,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(40,10,80,0.35)', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 90, paddingHorizontal: 20 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: t.card, borderRadius: 20, padding: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sheetTitle: { fontFamily: font.bold, fontSize: 18, color: t.heading },
  offNote: { fontFamily: font.medium, fontSize: 12, color: '#8b3dff', backgroundColor: 'rgba(172,77,255,0.08)', borderRadius: 10, padding: 10, marginBottom: 8 },
  empty: { fontFamily: font.medium, fontSize: 14, color: t.muted, textAlign: 'center', paddingVertical: 24 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, marginBottom: 6 },
  itemNew: { backgroundColor: 'rgba(172,77,255,0.08)' },
  iconBubble: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemText: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: font.semi, fontSize: 14, color: t.text },
  itemSub: { fontFamily: font.medium, fontSize: 12, marginTop: 2 },
});

function useStyles() {
  const { theme } = useTheme();
  return useMemo(() => makeStyles(theme), [theme]);
}
