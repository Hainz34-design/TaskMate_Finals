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
import { loginUser, registerUser } from './src/services/authApi';

export default function App() {
  // Isang stage lang ang ipinapakita para sundan ang welcome-to-home flow.
  const [stage, setStage] = useState('welcome');
  // Backend response ito; nasa memory lang at nawawala kapag isinara/reload ang app.
  const [session, setSession] = useState(null);
  // Hintayin ang Poppins fonts bago mag-render para hindi mag-flash ang fallback.
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  if (!loaded) return null;

  // Buksan lang ang Home kapag pumasa ang email/password sa backend.
  const handleLogin = async (email, password) => {
    const nextSession = await loginUser({ email, password });
    setSession(nextSession);
    setStage('home');
  };

  // I-save ang bagong account sa backend; ibalik nito ang user at login token.
  const handleRegistration = async (fullName, email, password) => {
    const nextSession = await registerUser({ fullName, email, password });
    setSession(nextSession);
    setStage('home');
  };

  // I-clear ang session para hindi manatiling naka-login pagkatapos mag-logout.
  const handleLogout = () => {
    setSession(null);
    setStage('login');
  };

  // I-render ang auth flow o tab navigator ayon sa kasalukuyang stage.
  return (
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
  );
}
