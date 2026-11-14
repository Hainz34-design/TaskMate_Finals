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

// Gumagawa ng tab navigation at nagbabahagi ng task/session callbacks sa screens.
export default function TabNavigator({ onLogout, user }) {
  // Tasks are temporarily in memory; hindi pa sila sini-save sa backend.
  const [tasks, setTasks] = useState([]);

  // Gumawa ng bagong array at baligtarin lang ang completed flag ng target ID.
  const handleToggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Panatilihin ang ibang tasks at alisin ang may kaparehong ID.
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Shared tab appearance; bawat route name ang tumutukoy sa icon nito.
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
          // Return null kung hidden/unsupported ang route at walang tab icon.
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
        {/* Ibigay ang signed-in user para maipakita ang pangalan sa greeting. */}
        {() => (
          <HomeScreen user={user} tasks={tasks} onToggleTask={handleToggleTask} />
        )}
      </Tab.Screen>

      <Tab.Screen name="Tasks">
        {/* Ibigay ang task list at callbacks para ma-edit ang tasks. */}
        {() => (
          <TasksScreen 
            tasks={tasks} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Calendar">
        {/* Ibigay ang parehong task data para sa calendar view. */}
        {() => (
          <CalendarScreen 
            tasks={tasks} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {/* Ipakita ang account mula sa auth session at logout callback. */}
        {() => <ProfileScreen tasks={tasks} onLogout={onLogout} user={user} />}
      </Tab.Screen>

      {/* Naa-access lang mula sa FAB; hindi ipinapakita bilang bottom tab. */}
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