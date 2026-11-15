import React, { useState } from 'react';
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
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import TabNavigator from './src/navigations/TabNavigators';
import { loginUser, registerUser } from './src/services/authApi';

export default function App() {
  const [stage, setStage] = useState('welcome');
  const [session, setSession] = useState(null);
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  if (!loaded) return null;

  const handleLogin = async (email, password) => {
    const nextSession = await loginUser({ email, password });
    setSession(nextSession);
    setStage('home');
  };

  const handleRegistration = async (fullName, email, password) => {
    const nextSession = await registerUser({ fullName, email, password });
    setSession(nextSession);
    setStage('home');
  };

  const handleLogout = () => {
    setSession(null);
    setStage('login');
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style={stage === 'home' ? 'dark' : 'auto'} />
        {stage === 'welcome' && <WelcomeFlow onDone={() => setStage('login')} />}
        {stage === 'login' && <LoginScreen onLogin={handleLogin} onGoToSignup={() => setStage('signup')} />}
        {stage === 'signup' && <SignupScreen onCreateAccount={handleRegistration} onGoToLogin={() => setStage('login')} />}
        {stage === 'home' && (
          <NavigationContainer>
            <TabNavigator onLogout={handleLogout} user={session?.user} />
          </NavigationContainer>
        )}
      </View>
    </SafeAreaProvider>
  );
}
