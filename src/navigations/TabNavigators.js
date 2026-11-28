import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import { colors, font } from '../theme';
import { useTheme } from '../ThemeContext';

const Tab = createBottomTabNavigator();

// tasks and the add / toggle / delete handlers now come from App.js (saved in MongoDB)
export default function TabNavigator({
  onLogout,
  user,
  tasks = [],
  onAddTask,
  onToggleTask,
  onDeleteTask,
  profileImages,
  onChangeImage,
  pushEnabled,
  onTogglePush,
  token,
  onUserUpdated,
  onAccountDeleted,
  googleAccessToken = null,
}) {
  const insets = useSafeAreaInsets();
  const { theme: t, dark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: dark ? '#d3a6ff' : colors.purple,
        tabBarLabelPosition: 'below-icon',
        tabBarInactiveTintColor: colors.tabGrey,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [styles.tabBar, { height: 64 + insets.bottom, paddingBottom: Math.max(insets.bottom, 6), backgroundColor: t.tabBar, borderTopColor: t.divider }],
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
            <View style={[styles.iconContainer, focused && { backgroundColor: dark ? 'rgba(172,77,255,0.3)' : 'rgba(229,199,255,0.6)' }]}>
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen
            user={user}
            tasks={tasks}
            onToggleTask={onToggleTask}
            pushEnabled={pushEnabled}
            profileImages={profileImages}
            googleAccessToken={googleAccessToken}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Tasks">
        {() => (
          <TasksScreen
            tasks={tasks}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Calendar">
        {() => (
          <CalendarScreen
            tasks={tasks}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            googleAccessToken={googleAccessToken}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            tasks={tasks}
            onLogout={onLogout}
            user={user}
            profileImages={profileImages}
            onChangeImage={onChangeImage}
            pushEnabled={pushEnabled}
            onTogglePush={onTogglePush}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="AddTaskScreen"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      >
        {() => <AddTaskScreen onAddTask={onAddTask} />}
      </Tab.Screen>

      <Tab.Screen
        name="PrivacySecurity"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      >
        {() => (
          <PrivacySecurityScreen
            user={user}
            token={token}
            onUserUpdated={onUserUpdated}
            onAccountDeleted={onAccountDeleted}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
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
    marginTop: 4,
  },
});