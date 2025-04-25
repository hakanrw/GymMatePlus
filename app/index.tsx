import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import Welcome from './Screens/Welcome';

import ProfileScreen from './Screens/ProfileScreen';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import GymSelection from "@/app/Screens/GymSelection";
import Payment from "@/app/Screens/Payment";
import { Dumbell } from '@/components/Dumbell';
import Home from './Screens/Main/Home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation } from '@react-navigation/native';
import Calendar from './Screens/Main/Calendar';
import Profile from './Screens/Main/Profile';
import Chat from './Screens/Main/Chat';
import QR from './Screens/Main/QR';

// ✅ Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDVI_lPO3kYfCJYzFKDoE2kvbsBkUktP9M',
  authDomain: 'mygymmate-6082a.firebaseapp.com',
  projectId: 'mygymmate-6082a',
  storageBucket: 'mygymmate-6082a.appspot.com',
  messagingSenderId: '76174759333',
  appId: '1:76174759333:web:0999e195bf90296b87c44c',
};

// ✅ Safe Firebase Init
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp);

WebBrowser.maybeCompleteAuthSession();
const Stack = createNativeStackNavigator();

function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');


  const redirectUri = makeRedirectUri({
    native: 'mygymmateplus:/oauth2redirect'
  });


  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '1049174255454-l3n3o3sm9i3aksoopvdpn6fksrb6ai5h.apps.googleusercontent.com',
    redirectUri,
    scopes: ['openid', 'email', 'profile'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);

      signInWithCredential(auth, credential)
          .then(userCredential => {
            console.log('Firebase login success:', userCredential.user.email);
          })
          .catch(error => {
            console.error('Firebase sign-in failed:', error);
          });
    }
  }, [response]);

  const handleContinue = () => {
    navigation.navigate('Profile', { email: email || 'test@example.com' });
  };

  const handleGoogleLogin = () => {
    if (request) {
      console.log("→ redirectUri:", redirectUri);
      promptAsync();
    } else {
      console.warn('Google auth request not ready yet.');
    }
  };

  const handleAppleSignUp = () => {
    console.log('Continue with Apple');
  };

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#fff" translucent={false} />
        <View style={styles.logoContainer}>
          <Dumbell/>
          <Text style={styles.title}>GymMate+</Text>
        </View>

        <Text style={styles.header}>Create an account</Text>
        <Text style={styles.subHeader}>Enter your email to sign up for this app</Text>

        <TextInput
            style={styles.input}
            placeholder="email@domain.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleContinue}>
          <Text style={styles.submitText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
          <FontAwesome name="google" size={20} color="#DB4437" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignUp}>
          <FontAwesome name="apple" size={20} color="black" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By clicking continue, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
  );
}



export default function App() {
  return (
        <Stack.Navigator>
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="WelcomeScreen" component={Welcome} options={{ headerShown: false }} />
          <Stack.Screen name="GymSelection" component={GymSelection} options={{ headerShown: false }} />
          <Stack.Screen name="Payment" component={Payment} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
  )
}
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarStyle: {
            backgroundColor: '#fff',
            height: 70,
            paddingTop: 10,
            borderTopWidth: 0,
          },
          tabBarShowLabel: false
    }}>
      <Tab.Screen name="Home" component={Home} options={{tabBarIcon: ({color,size}) => <FontAwesome name="home" size={size} color={color}/>}}/>
      <Tab.Screen name="Calendar" component={Calendar} options={{tabBarIcon: ({color,size}) => <FontAwesome name="calendar" size={size} color={color}/>}}/>
      <Tab.Screen
        name="QR"
        component={QR}
        options={{
        tabBarIcon: ({ focused }) => (
            <View
                style={{
                    width: 70,
                    height: 70,
                    borderRadius: 10,
                    backgroundColor: '#000',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 30, // push it up
                    elevation: 5, // for Android shadow
                }}>
                <FontAwesome
                    name="qrcode"
                    size={40}
                    color={'#fff'}
                />
            </View>
            ),
        }}
      />
      <Tab.Screen name="Chat" component={Chat} options={{tabBarIcon: ({color,size}) => <FontAwesome name="superpowers" size={size} color={color}/>}}/>
      <Tab.Screen name="Profile" component={Profile} options={{tabBarIcon: ({color,size}) => <FontAwesome name="user" size={size} color={color}/>}}/>
      {/* Add more tabs like below if needed */}
      {/* <Tab.Screen name="Settings" component={Settings} /> */}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    width: '90%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#000',
    height: 50,
    width: '90%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  orText: {
    color: '#999',
    marginHorizontal: 10,
  },
  socialButton: {
    flexDirection: 'row',
    height: 50,
    width: '90%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#eeeeee',
    marginBottom: 12,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  termsContainer: {
    marginTop: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  linkText: {
    color: '#000',
    textDecorationLine: 'underline',
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
});
