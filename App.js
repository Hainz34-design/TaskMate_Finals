import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
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

export default function App() {
  const [stage, setStage] = useState('welcome');
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  if (!loaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={stage === 'home' ? 'dark' : 'auto'} />
      {stage === 'welcome' && <WelcomeFlow onDone={() => setStage('login')} />}
      {stage === 'login' && <LoginScreen onLogin={() => setStage('home')} onGoToSignup={() => setStage('signup')} />}
      {stage === 'signup' && <SignupScreen onCreateAccount={() => setStage('home')} onGoToLogin={() => setStage('login')} />}
      {stage === 'home' && (
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      )}
    </View>
  );
}
