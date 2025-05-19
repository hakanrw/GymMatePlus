import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { Dumbell } from '@/components/Dumbell';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth, firestore } from '../../firebaseConfig';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, SignInSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from '@firebase/firestore';

// Default program template
const defaultProgram = {
    Monday: [
        { exercise: 'BB Back Squat', sets: '3x3-5', rpe: '7-8' },
        { exercise: 'Bench Press', sets: '4x4-6', rpe: '7-8' },
    ],
    Wednesday: [
        { exercise: 'Deadlift', sets: '3x5', rpe: '7-8' },
        { exercise: 'OHP', sets: '3x8', rpe: '7-8' },
    ],
    Friday: [
        { exercise: 'Front Squat', sets: '3x8', rpe: '7-8' },
        { exercise: 'Row', sets: '3x10', rpe: '7-8' },
    ],
};

async function assignRandomCoach(userId: string) {
    try {
        // Query for all coaches
        const coachesQuery = query(
            collection(firestore, 'users'),
            where('accountType', '==', 'coach')
        );
        const coachesSnapshot = await getDocs(coachesQuery);

        if (coachesSnapshot.empty) {
            console.log('No coaches available, skipping coach assignment');
            return null;
        }

        // Select a random coach
        const coaches = coachesSnapshot.docs;
        const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];

        // Update the user's coach field
        await updateDoc(doc(firestore, 'users', userId), {
            coach: randomCoach.id
        });

        // Add the user to the coach's trainees list
        await updateDoc(doc(firestore, 'users', randomCoach.id), {
            trainees: [...(randomCoach.data().trainees || []), userId]
        });

        return randomCoach.id;
    } catch (error) {
        console.error('Error assigning coach:', error);
        return null;
    }
}

function SignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    
    const handleContinue = () => {
    };
  
    const handleGoogleLogin = async () => {
        if (Platform.OS === "web") {
            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            try {
                const result = await signInWithPopup(getAuth(), provider);
                const user = result.user;
                
                // Store minimal user data in Firestore
                const userRef = doc(firestore, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    // Create the user document
                    await setDoc(userRef, {
                        onBoardingComplete: false,
                        accountType: 'user',
                        program: defaultProgram
                    });

                    // Assign a random coach
                    const coachId = await assignRandomCoach(user.uid);
                    if (!coachId) {
                        console.log('No coach assigned during signup');
                    }
                }
                
                console.log("Successfully signed in with Google");
            } catch (error) {
                console.error("Error signing in with Google:", error);
            }
        } else {
            try {
                GoogleSignin.configure({
                    scopes: ['profile', 'email']
                });
                
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();
                
                if (isSuccessResponse(response)) {
                    const tokens = await GoogleSignin.getTokens();
                    const credential = GoogleAuthProvider.credential(
                        tokens.idToken,
                        tokens.accessToken
                    );
                    const result = await signInWithCredential(getAuth(), credential);
                    const user = result.user;
                    
                    // Store minimal user data in Firestore
                    const userRef = doc(firestore, 'users', user.uid);
                    const userDoc = await getDoc(userRef);
                    
                    if (!userDoc.exists()) {
                        // Create the user document
                        await setDoc(userRef, {
                            onBoardingComplete: false,
                            accountType: 'user',
                            program: defaultProgram
                        });

                        // Assign a random coach
                        const coachId = await assignRandomCoach(user.uid);
                        if (!coachId) {
                            console.log('No coach assigned during signup');
                        }
                    }
                    console.log("Successfully signed in with Google on mobile");
                } else {
                    console.error("Failed to sign in with Google on mobile");
                }
            } catch (error) {
                if (isErrorWithCode(error)) {
                    switch (error.code) {
                        case statusCodes.IN_PROGRESS:
                            console.error("Sign in already in progress");
                            break;
                        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                            console.error("Play services not available");
                            break;
                        default:
                            console.error("Error:", error);
                    }
                } else {
                    console.error("Unknown error:", error);
                }
            }
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

export default SignUpScreen;
  
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
  