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
import GymSelection from "@/app/Screens/GymSelection";
import Payment from "@/app/Screens/Payment";
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
import SignUpScreen from './Screens/SignUp';
import ChatRoom from './Screens/ChatRoom';
import PaymentSuccess from './Screens/PaymentSuccess';

WebBrowser.maybeCompleteAuthSession();
const Stack = createNativeStackNavigator();

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
        </Stack.Navigator>
    );
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
    const [gym, setGym] = useState<number | null>(-1);
    
    const [pingTrigger, setPingTrigger] = useState(false); // or use a counter (number)
    const togglePing = () => setPingTrigger(prev => !prev); // toggles between true/false

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        console.log("User", user);
      });
  
      return unsubscribe;
    }, []);

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
          // Check onboarding status
          const docRef = doc(getFirestore(), 'users', user.uid);
          getDoc(docRef).then(docSnap => {
            setGym(docSnap.data()?.gym);
          });
        }
    }, [user, onboardingComplete, pingTrigger]);
  
    if (loading || (user && onboardingComplete === null) || (user && onboardingComplete && gym === -1)) return null;

    return (
      <AppContext.Provider value={{ping: togglePing}}>
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