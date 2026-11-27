import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import WelcomeFlow from './src/screens/WelcomeFlow';
import StartupSplash from './src/screens/StartupSplash';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import TabNavigator from './src/navigations/TabNavigators';
import { loginUser, registerUser } from './src/services/authApi';
import { createTask, deleteTask, fetchTasks, updateTask } from './src/services/taskApi';
import { fetchProfile, saveProfileImage } from './src/services/profileApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notifyNow, setupNotifications, syncTaskReminders } from './src/services/notifications';
import { ThemeProvider, useTheme } from './src/ThemeContext';

const SESSION_KEY = 'taskmate_session';
const PUSH_KEY = 'taskmate_push_enabled';

async function saveSession(session) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore: the user just won't stay logged in
  }
}

function AppContent() {
  const { dark } = useTheme();
  const [stage, setStage] = useState('splash');
  const [session, setSession] = useState(null);
  const [restored, setRestored] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [profileImages, setProfileImages] = useState({ avatar: '', cover: '' });
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  // Load the saved login (if any) when the app opens
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : null;
        if (saved?.token) setSession(saved);
      })
      .catch(() => {})
      .finally(() => setRestored(true));
  }, []);

  // After the splash: go straight to home if already logged in
  useEffect(() => {
    if (!loaded || !restored || stage !== 'splash') return undefined;

    const timer = setTimeout(() => setStage(session?.token ? 'home' : 'welcome'), 1500);
    return () => clearTimeout(timer);
  }, [loaded, restored, stage, session]);

  // Load this user's tasks from MongoDB after login / signup
  useEffect(() => {
    if (!session?.token) {
      setTasks([]);
      setProfileImages({ avatar: '', cover: '' });
      return;
    }
    fetchTasks(session.token)
      .then(setTasks)
      .catch((error) => {
        console.warn('Could not load tasks:', error.message);
        // saved login has expired -> clear it and ask the user to log in again
        if (/session expired|not signed in/i.test(error.message)) {
          AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
          setSession(null);
          setStage('login');
        }
      });
    fetchProfile(session.token)
      .then((p) => setProfileImages({ avatar: p.avatar || '', cover: p.cover || '' }))
      .catch((error) => console.warn('Could not load profile pictures:', error.message));
  }, [session?.token]);

  // Load the Push Notification switch (default: off until the user turns it on)
  useEffect(() => {
    AsyncStorage.getItem(PUSH_KEY)
      .then((v) => {
        if (v === '1') setPushEnabled(true);
      })
      .catch(() => {});
  }, []);

  // Ask for notification permission once the user is logged in
  useEffect(() => {
    if (session?.token) setupNotifications();
  }, [session?.token]);

  // Keep the phone reminders in sync with the task list (and clear them on logout)
  useEffect(() => {
    syncTaskReminders(session?.token ? tasks : [], pushEnabled);
  }, [tasks, session?.token, pushEnabled]);

  const handleTogglePush = (value) => {
    setPushEnabled(value);
    AsyncStorage.setItem(PUSH_KEY, value ? '1' : '0').catch(() => {});
    if (value) {
      setupNotifications().then((ok) => {
        if (ok) notifyNow('Notifications are on', 'We will remind you when your tasks are due.');
      });
    }
  };

  const handleLogin = async (email, password) => {
    const nextSession = await loginUser({ email, password });
    await saveSession(nextSession);
    setSession(nextSession);
    setStage('home');
  };

  const handleRegistration = async (fullName, email, password) => {
    const nextSession = await registerUser({ fullName, email, password });
    await saveSession(nextSession);
    setSession(nextSession);
    setStage('home');
  };

  const handleLogout = () => {
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
    setSession(null);
    setTasks([]);
    setStage('login');
  };

  // Saves to MongoDB first, then adds the saved task to the list
  const handleAddTask = async (task) => {
    if (!session?.token) throw new Error('Your session has expired. Please log in again.');
    const saved = await createTask(session.token, task);
    setTasks((prev) => [saved, ...prev]);
  };

  // Tick / untick a task (updates the screen right away, then saves to MongoDB)
  const handleToggleTask = async (id) => {
    const current = tasks.find((t) => t.id === id);
    if (!current || !session?.token) return;
    const completed = !current.completed;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    try {
      await updateTask(session.token, id, { completed });
    } catch (error) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: current.completed } : t)));
      console.warn('Could not update task:', error.message);
    }
  };

  // kind is 'avatar' (profile picture) or 'cover' (background rectangle)
  const handleChangeImage = async (kind, dataUri) => {
    if (!session?.token) throw new Error('Your session has expired. Please log in again.');
    const saved = await saveProfileImage(session.token, kind, dataUri);
    setProfileImages({ avatar: saved.avatar || '', cover: saved.cover || '' });
  };

  // Called after the name or email changes, so the app and the saved login stay up to date
  const handleUserUpdated = (nextUser) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...nextUser } };
      saveSession(next);
      return next;
    });
  };

  const handleDeleteTask = async (id) => {
    if (!session?.token) return;
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(session.token, id);
    } catch (error) {
      setTasks(previous);
      console.warn('Could not delete task:', error.message);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style={stage === 'home' && dark ? 'light' : stage === 'home' || stage === 'splash' ? 'dark' : 'auto'} />
        {stage === 'splash' && <StartupSplash fontsLoaded={loaded} />}
        {stage === 'welcome' && <WelcomeFlow onDone={() => setStage('login')} />}
        {stage === 'login' && <LoginScreen onLogin={handleLogin} onGoToSignup={() => setStage('signup')} />}
        {stage === 'signup' && <SignupScreen onCreateAccount={handleRegistration} onGoToLogin={() => setStage('login')} />}
        {stage === 'home' && (
          <NavigationContainer>
            <TabNavigator
              onLogout={handleLogout}
              user={session?.user}
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              profileImages={profileImages}
              onChangeImage={handleChangeImage}
              pushEnabled={pushEnabled}
              onTogglePush={handleTogglePush}
              token={session?.token}
              onUserUpdated={handleUserUpdated}
              onAccountDeleted={handleLogout}
            />
          </NavigationContainer>
        )}
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
