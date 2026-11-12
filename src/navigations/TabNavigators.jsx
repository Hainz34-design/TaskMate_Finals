import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

function PlaceholderScreen({ route }) {
  return (
    <View style={styles.placeholderRoot}>
      <ScaledCanvas>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{route.name} screen is not part of splash 1–11</Text>
        </View>
      </ScaledCanvas>
    </View>
  );
}

export default function TabNavigator() {
  // Starts completely empty, ready for backend/user-added tasks
  const [tasks, setTasks] = useState([]);

  const handleToggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.tabGrey,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Home: 'home-outline',
            Tasks: 'checkbox-outline',
            Calendar: 'calendar-outline',
            Profile: 'person-outline',
          };
          return (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={icons[route.name]} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        children={() => (
          <HomeScreen tasks={tasks} onToggleTask={handleToggleTask} />
        )} 
      />
      
      <Tab.Screen 
        name="Tasks" 
        children={() => (
          <TasksScreen 
            tasks={tasks} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask} 
          />
        )} 
      />

      <Tab.Screen 
        name="Calendar" 
        children={() => (
          <CalendarScreen 
            tasks={tasks} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask} 
          />
        )} 
      />

      <Tab.Screen name="Profile" component={PlaceholderScreen} />

      <Tab.Screen 
        name="AddTaskScreen" 
        component={AddTaskScreen} 
        options={{ tabBarButton: () => null }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    height: 94,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(200,200,200,0.74)',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(229,199,255,0.6)',
  },
  tabLabel: { 
    fontFamily: font.medium, 
    fontSize: 11, 
    marginTop: 2 
  },
  placeholderRoot: { flex: 1, backgroundColor: colors.screenBg },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontFamily: font.medium, fontSize: 14, color: colors.lightGrey },
});