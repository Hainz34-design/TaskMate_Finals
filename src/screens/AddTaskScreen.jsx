import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

export default function AddTaskScreen() {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('LOW'); // 'HIGH' | 'MEDIUM' | 'LOW'
  const [subject, setSubject] = useState('');

  const handleSaveTask = () => {
    // TODO: Send task data to your backend or state management
    console.log({ title, description, dueDate, time, priority, subject });
    navigation.goBack(); // Return to previous screen after saving
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#ac4dff', '#c98cfe']} style={styles.headerGradient}>
        <ScaledCanvas>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>New Task</Text>
            <View style={styles.iconBox}>
              <Ionicons name="book-outline" size={24} color="#000" />
            </View>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
            {/* Task Title */}
            <Text style={styles.label}>TASK TITLE *</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="Add a title"
              placeholderTextColor="#bbbbbb"
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.inputBox, styles.textArea]}
              placeholder="Add a description"
              placeholderTextColor="#bbbbbb"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* Due Date & Time row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.label}>DUE DATE</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#bbbbbb"
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>TIME</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder="HH:MM AM/PM"
                  placeholderTextColor="#bbbbbb"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>

            {/* Priority Selection */}
            <Text style={styles.label}>PRIORITY</Text>
            <View style={styles.priorityRow}>
              <Pressable
                style={[styles.priorityCard, priority === 'HIGH' && styles.priorityHighSelected]}
                onPress={() => setPriority('HIGH')}
              >
                <View style={[styles.priorityDot, { backgroundColor: '#ff6262' }]} />
                <Text style={[styles.priorityText, priority === 'HIGH' && styles.priorityTextSelected]}>High</Text>
              </Pressable>

              <Pressable
                style={[styles.priorityCard, priority === 'MEDIUM' && styles.priorityMedSelected]}
                onPress={() => setPriority('MEDIUM')}
              >
                <View style={[styles.priorityDot, { backgroundColor: '#ffae00' }]} />
                <Text style={[styles.priorityText, priority === 'MEDIUM' && styles.priorityTextSelected]}>Medium</Text>
              </Pressable>

              <Pressable
                style={[styles.priorityCard, priority === 'LOW' && styles.priorityLowSelected]}
                onPress={() => setPriority('LOW')}
              >
                <View style={[styles.priorityDot, { backgroundColor: '#4cd964' }]} />
                <Text style={[styles.priorityText, priority === 'LOW' && styles.priorityTextSelected]}>Low</Text>
              </Pressable>
            </View>

            {/* Subject */}
            <Text style={styles.label}>TYPE</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="Add type of task (e.g., Work, Personal)"
              placeholderTextColor="#bbbbbb"
              value={subject}
              onChangeText={setSubject}
            />

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveTask}>
                <Text style={styles.saveButtonText}>Add Task</Text>
              </Pressable>
            </View>
          </ScrollView>
        </ScaledCanvas>
      </LinearGradient>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 4 }, elevation: 3 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ac4dff' },
  headerGradient: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginHorizontal: 24, marginBottom: 20 },
  headerTitle: { fontFamily: font.bold, fontSize: 24, color: '#fff' },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow },
  scroll: { marginHorizontal: 24 },
  label: { fontFamily: font.bold, fontSize: 12, color: '#fff', marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
  inputBox: { backgroundColor: '#fff', borderRadius: 14, height: 52, paddingHorizontal: 16, fontFamily: font.medium, fontSize: 15, color: '#000', ...shadow },
  textArea: { height: 90, textAlignVertical: 'top', paddingTop: 14 },
  row: { flexDirection: 'row' },
  priorityRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  priorityCard: { flex: 1, height: 60, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', ...shadow },
  priorityHighSelected: { borderColor: '#ff6262', backgroundColor: 'rgba(255,98,98,0.08)' },
  priorityMedSelected: { borderColor: '#ffae00', backgroundColor: 'rgba(255,174,0,0.08)' },
  priorityLowSelected: { borderColor: '#4cd964', backgroundColor: 'rgba(76,217,100,0.08)' },
  priorityDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 4 },
  priorityText: { fontFamily: font.semi, fontSize: 12, color: '#666' },
  priorityTextSelected: { fontFamily: font.bold, color: '#000' },
  buttonRow: { flexDirection: 'row', gap: 16, marginTop: 32 },
  cancelButton: { flex: 1, height: 52, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadow },
  cancelButtonText: { fontFamily: font.bold, fontSize: 15, color: '#888' },
  saveButton: { flex: 1, height: 52, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadow },
  saveButtonText: { fontFamily: font.bold, fontSize: 15, color: '#ac4dff' },
});