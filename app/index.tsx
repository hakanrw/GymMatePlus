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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    signInWithEmailAndPassword, 
    signInWithCredential, 
    GoogleAuthProvider 
} from 'firebase/auth';

import Welcome from './Screens/GymSelection/Welcome';

import ProfileScreen from './Screens/Onboarding/ProfileScreen';
import GymSelection from "@/app/Screens/GymSelection/GymSelection";
import Payment from "@/app/Screens/GymSelection/Payment";
import { Dumbell } from '@/components/Dumbell';
import Home from './Screens/Main/Home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation, NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import Calendar from './Screens/Main/Calendar';
import Profile from './Screens/Main/Profile';
import Chat from './Screens/Main/Chat';
import QR from './Screens/Main/QR';
import { AppContext } from '@/contexts/PingContext';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from '@firebase/firestore';
import UserProfile from './Screens/Main/UserProfile';
import SignUpScreen from './Screens/Auth/SignUp';
import ChatRoom from './Screens/Main/ChatRoom';
import PaymentSuccess from './Screens/GymSelection/PaymentSuccess';
import UserSelection from './Screens/Main/UserSelection';
import CoachCalendar from './Screens/Main/CoachCalendar';
import ProgramEditor from './Screens/Main/ProgramEditor';
import AIChat from './Screens/Main/AIChat';
import ExerciseDetail from './Screens/Main/ExerciseDetail';
import AreaExercises from './Screens/Main/AreaExercises';
import EntryHistory from './Screens/Main/EntryHistory';
import Settings from './Screens/Main/Settings';
import TraineeEntries from './Screens/Main/TraineeEntries';
import Exercises from './Screens/Main/Exercises';
import { AuthMethodProvider } from '@/contexts/AuthMethodContext';

WebBrowser.maybeCompleteAuthSession();
const Stack = createNativeStackNavigator();

const AUTH_STATE_KEY = '@gymmate_auth_state';
const USER_CREDENTIALS_KEY = '@gymmate_user_credentials';

function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function OnboardingStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function GymSelectionStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="WelcomeScreen" component={Welcome} options={{ headerShown: false }} />
            <Stack.Screen name="GymSelection" component={GymSelection} options={{ headerShown: false }} />
            <Stack.Screen name="Payment" component={Payment} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function CalendarStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="CalendarMain" component={Calendar} options={{ headerShown: false }} />
            <Stack.Screen
                name="ExerciseDetail"
                component={ExerciseDetail}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AreaExercises"
                component={AreaExercises}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="HomeMain" component={Home} options={{ headerShown: false }} />
            <Stack.Screen
                name="ExerciseDetail"
                component={ExerciseDetail}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AreaExercises"
                component={AreaExercises}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Exercises"
                component={Exercises}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen 
                name="ChatRoom" 
                component={ChatRoom} 
                options={{ 
                    headerShown: false,
                    presentation: 'card'
                }} 
            />
            <Stack.Screen 
                name="UserSelection" 
                component={UserSelection} 
                options={{ 
                    headerShown: false,
                    presentation: 'card'
                }} 
            />
            <Stack.Screen
                name="UserProfile"
                component={UserProfile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CoachCalendar"
                component={CoachCalendar}
                options={{ 
                    headerShown: false,
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="ProgramEditor"
                component={ProgramEditor}
                options={{ 
                    headerShown: false,
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="AIChat"
                component={AIChat}
                options={{ 
                    headerShown: false,
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="EntryHistory"
                component={EntryHistory}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Settings"
                component={Settings}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TraineeEntries"
                component={TraineeEntries}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
    const [gym, setGym] = useState<number | null>(-1);
    const [authRestoreAttempted, setAuthRestoreAttempted] = useState(false);
    
    const [pingTrigger, setPingTrigger] = useState(false);
    const togglePing = () => setPingTrigger(prev => !prev);

    // Configure Google Sign-In when app starts
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '714875913611-8csudoq3gdh0rjd321291juu4a0mssod.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
            offlineAccess: true,
        });
    }, []);

    // Attempt to restore auth state on app start
    useEffect(() => {
        const restoreAuthState = async () => {
            try {
                console.log('🔐 Attempting to restore auth state...');
                
                const storedCredentials = await AsyncStorage.getItem(USER_CREDENTIALS_KEY);
                if (storedCredentials) {
                    const credentials = JSON.parse(storedCredentials);
                    console.log('🔐 Found stored credentials, attempting auto-login...');
                    
                    if (credentials.type === 'email') {
                        // Restore email/password login
                        await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
                        console.log('✅ Auto-login successful with email/password');
                    } else if (credentials.type === 'google' && credentials.refreshToken) {
                        // Restore Google login
                        try {
                            await GoogleSignin.signInSilently();
                            const tokens = await GoogleSignin.getTokens();
                            const credential = GoogleAuthProvider.credential(
                                tokens.idToken,
                                tokens.accessToken
                            );
                            await signInWithCredential(auth, credential);
                            console.log('✅ Auto-login successful with Google');
                        } catch (googleError) {
                            console.log('❌ Google silent sign-in failed:', googleError);
                            // Clear invalid Google credentials
                            await AsyncStorage.removeItem(USER_CREDENTIALS_KEY);
                        }
                    }
                } else {
                    console.log('🔐 No stored credentials found');
                }
            } catch (error) {
                console.error('❌ Auth restoration failed:', error);
                // Clear invalid credentials
                await AsyncStorage.removeItem(USER_CREDENTIALS_KEY);
            } finally {
                setAuthRestoreAttempted(true);
                
                // Set loading to false after auth restoration attempt
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        };

        restoreAuthState();
    }, []);

    // Listen to auth state changes
    useEffect(() => {
        if (!authRestoreAttempted) return;
        
        console.log('🔐 Setting up auth state listener...');
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('🔐 Auth state changed:', user ? `✅ User: ${user.email}` : '❌ No user');
            setUser(user);
            
            if (user) {
                // Store auth state for quick UI feedback
                await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify({
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid,
                    timestamp: Date.now()
                }));
            } else {
                // Clear auth state
                await AsyncStorage.removeItem(AUTH_STATE_KEY);
                await AsyncStorage.removeItem(USER_CREDENTIALS_KEY);
            }
        });

        return unsubscribe;
    }, [authRestoreAttempted]);

    useEffect(() => {
        console.log("Onboard check");
        if (user) {
          // Check onboarding status
          const docRef = doc(getFirestore(), 'users', user.uid);
          getDoc(docRef).then(docSnap => {
            setOnboardingComplete(docSnap.data()?.onBoardingComplete ?? false);
          });
        } else {
          setOnboardingComplete(null);
        }
    }, [user, pingTrigger]);

    useEffect(() => {
        if (user && onboardingComplete) {
          // Check gym selection status
          const docRef = doc(getFirestore(), 'users', user.uid);
          getDoc(docRef).then(docSnap => {
            setGym(docSnap.data()?.gym);
          });
        }
    }, [user, onboardingComplete, pingTrigger]);
  
    if (loading || (user && onboardingComplete === null) || (user && onboardingComplete && gym === -1)) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>GymMate+</Text>
                    <Text style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>Initializing your fitness journey</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF' }} />
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', opacity: 0.7 }} />
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', opacity: 0.4 }} />
                    </View>
                </View>
            </View>
        );
    }

    return (
      <AppContext.Provider value={{ping: togglePing}}>
        <AuthMethodProvider>
          <NavigationIndependentTree>
            {!user ? (
                <AuthStack />
            ) : !onboardingComplete ? (
                <OnboardingStack />
            ) : gym == null ? (
                <GymSelectionStack />
            ) : (
                <AppStack />
            )}      
          </NavigationIndependentTree>
        </AuthMethodProvider>
      </AppContext.Provider>
    );
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
      <Tab.Screen name="Home" component={HomeStack} options={{tabBarIcon: ({color,size}) => <FontAwesome name="home" size={size} color={color}/>}}/>
      <Tab.Screen name="Calendar" component={CalendarStack} options={{tabBarIcon: ({color,size}) => <FontAwesome name="calendar" size={size} color={color}/>}}/>
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
