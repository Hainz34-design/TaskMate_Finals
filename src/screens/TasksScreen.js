import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

export default function TasksScreen({ tasks = [], onToggleTask, onDeleteTask }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'DONE'
  const [activePriority, setActivePriority] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'

  // Filter tasks based on search, tab, and priority
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeTab === 'PENDING' && t.completed) return false;
    if (activeTab === 'DONE' && !t.completed) return false;

    if (activePriority !== 'ALL' && t.priority?.label !== activePriority) return false;

    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const doneCount = tasks.filter(t => t.completed).length;

  return (
    <View style={styles.root}>
      <ScaledCanvas>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.subtitle}>{pendingCount} pending . {doneCount} completed</Text>

          {/* Search Bar */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={colors.lightGrey} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Tasks..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Status Filter Tabs */}
          <View style={styles.filterTabRow}>
            <Pressable 
              style={[styles.filterTab, activeTab === 'ALL' && styles.activeFilterTab]} 
              onPress={() => setActiveTab('ALL')}
            >
              <Text style={[styles.filterTabText, activeTab === 'ALL' && styles.activeFilterTabText]}>
                All ({tasks.length})
              </Text>
            </Pressable>

            <Pressable 
              style={[styles.filterTab, activeTab === 'PENDING' && styles.activeFilterTab]} 
              onPress={() => setActiveTab('PENDING')}
            >
              <Text style={[styles.filterTabText, activeTab === 'PENDING' && styles.activeFilterTabText]}>
                Pending ({pendingCount})
              </Text>
            </Pressable>

            <Pressable 
              style={[styles.filterTab, activeTab === 'DONE' && styles.activeFilterTab]} 
              onPress={() => setActiveTab('DONE')}
            >
              <Text style={[styles.filterTabText, activeTab === 'DONE' && styles.activeFilterTabText]}>
                Done ({doneCount})
              </Text>
            </Pressable>
          </View>

          {/* Priority Filter Pills */}
          <View style={styles.priorityFilterRow}>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.priorityPill,
                  activePriority === p && styles.activePriorityPill,
                  p === 'HIGH' && activePriority === 'HIGH' && { borderColor: '#ff6262', backgroundColor: 'rgba(255,98,98,0.1)' },
                  p === 'MEDIUM' && activePriority === 'MEDIUM' && { borderColor: '#ffae00', backgroundColor: 'rgba(255,174,0,0.1)' },
                  p === 'LOW' && activePriority === 'LOW' && { borderColor: '#4cd964', backgroundColor: 'rgba(76,217,100,0.1)' },
                ]}
                onPress={() => setActivePriority(p)}
              >
                <Text style={[
                  styles.priorityPillText, 
                  activePriority === p && styles.activePriorityPillText,
                  p === 'HIGH' && activePriority === p && { color: '#ff6262' },
                  p === 'MEDIUM' && activePriority === p && { color: '#ffae00' },
                  p === 'LOW' && activePriority === p && { color: '#4cd964' },
                ]}>
                  {p === 'ALL' ? 'All Priority' : p.charAt(0) + p.slice(1).toLowerCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks found.</Text>
          ) : (
            filteredTasks.map((t) => (
              <View key={t.id} style={styles.taskCard}>
                <Pressable 
                  onPress={() => onToggleTask(t.id)} 
                  style={[
                    styles.check, 
                    { borderColor: t.priority?.color || colors.purple }, 
                    t.completed && { backgroundColor: t.priority?.color || colors.purple }
                  ]}
                >
                  {t.completed && <Ionicons name="checkmark" size={18} color="#fff" />}
                </Pressable>

                <Text style={[styles.taskTitle, t.completed && styles.struck]}>
                  {t.title}
                </Text>
                
                {t.description ? (
                  <Text style={styles.taskDesc} numberOfLines={1}>{t.description}</Text>
                ) : null}

                <View style={styles.metaRow}>
                  {t.priority && (
                    <View style={[styles.badge, { backgroundColor: t.priority.bg }]}>
                      <Text style={[styles.badgeText, { color: t.priority.color }]}>{t.priority.label}</Text>
                    </View>
                  )}
                  {t.subject ? (
                    <View style={styles.subjectBadge}>
                      <Text style={styles.subjectText}>{t.subject}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.code}>{t.dueDate ? `Due ${t.dueDate} - ${t.time || ''}` : ''}</Text>
                </View>

                <Pressable onPress={() => onDeleteTask(t.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#999" />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </ScaledCanvas>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { position: 'absolute', left: 24, top: 40, width: 350, height: 740 },
  headerTitle: { fontFamily: font.bold, fontSize: 32, color: '#000' },
  subtitle: { fontFamily: font.medium, fontSize: 14, color: colors.lightGrey, marginTop: 4, marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, height: 50, paddingHorizontal: 16, marginBottom: 16, ...shadow },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: font.medium, fontSize: 15, color: '#000' },
  filterTabRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 16, ...shadow },
  filterTab: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  activeFilterTab: { backgroundColor: colors.purple },
  filterTabText: { fontFamily: font.semi, fontSize: 13, color: colors.lightGrey },
  activeFilterTabText: { color: '#fff' },
  priorityFilterRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  priorityPill: { paddingHorizontal: 12, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  activePriorityPill: { borderColor: colors.purple, backgroundColor: 'rgba(172,77,255,0.1)' },
  priorityPillText: { fontFamily: font.semi, fontSize: 12, color: colors.lightGrey },
  activePriorityPillText: { fontFamily: font.bold, color: colors.purple },
  taskCard: { minHeight: 90, borderRadius: 16, backgroundColor: '#fff', marginBottom: 16, padding: 16, paddingLeft: 56, paddingRight: 40, ...shadow },
  check: { position: 'absolute', left: 16, top: 16, width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontFamily: font.semi, fontSize: 15, color: '#000' },
  taskDesc: { fontFamily: font.medium, fontSize: 13, color: colors.lightGrey, marginTop: 2 },
  struck: { textDecorationLine: 'line-through', opacity: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: font.bold, fontSize: 10 },
  subjectBadge: { backgroundColor: 'rgba(172,77,255,0.12)', paddingHorizontal: 8, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  subjectText: { fontFamily: font.bold, fontSize: 10, color: colors.purple },
  code: { fontFamily: font.medium, fontSize: 11, color: colors.lightGrey },
  deleteBtn: { position: 'absolute', right: 16, top: 16 },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: colors.lightGrey, textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
});