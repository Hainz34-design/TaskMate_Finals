import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import { colors, font } from '../theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ onLogout }) {
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
          const iconName = {
            Home: 'home-outline',
            Tasks: 'checkbox-outline',
            Calendar: 'calendar-outline',
            Profile: 'person-outline',
          }[route.name];

          if (!iconName) return null;

          return (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen tasks={tasks} onToggleTask={handleToggleTask} />
        )}
      </Tab.Screen>

      <Tab.Screen name="Tasks">
        {() => (
          <TasksScreen 
            tasks={tasks} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Calendar">
        {() => (
          <CalendarScreen 
            tasks={tasks} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {() => <ProfileScreen tasks={tasks} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="AddTaskScreen"
        component={AddTaskScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
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
});