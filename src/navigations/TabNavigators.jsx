import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ScaledCanvas from '../components/ScaledCanvas';
import { colors, font } from '../theme';

const Tab = createBottomTabNavigator();

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.tabGrey,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color }) => {
          const icons = {
            Home: 'home-outline',
            Tasks: 'checkbox-outline',
            Calendar: 'calendar-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={30} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={PlaceholderScreen} />
      <Tab.Screen name="Calendar" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 94,
    paddingTop: 13,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(200,200,200,0.74)',
    elevation: 4,
  },
  tabLabel: { fontFamily: font.medium, fontSize: 11, marginTop: 2 },
  placeholderRoot: { flex: 1, backgroundColor: colors.screenBg },
  placeholder: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: 780,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontFamily: font.medium, fontSize: 14, color: colors.lightGrey },
});
