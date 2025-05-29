import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { Dumbell } from '@/components/Dumbell';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithCredential, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth, firestore } from '../../firebaseConfig';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, SignInSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from '@firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import { useAuthMethod } from '@/contexts/AuthMethodContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for user credentials
const USER_CREDENTIALS_KEY = '@gymmate_user_credentials';

// Get the createUser function
const createUser = httpsCallable(functions, 'createUser');
const checkEmailExistsFunction = httpsCallable(functions, 'checkEmailExists');

function SignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordText, setShowPasswordText] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState<'email' | 'google' | null>(null);
    
    const { setAuthMethod: setGlobalAuthMethod } = useAuthMethod();
    
    // Animation refs
    const passwordSlideAnim = useRef(new Animated.Value(-50)).current;
    const passwordFadeAnim = useRef(new Animated.Value(0)).current;
    const buttonSlideAnim = useRef(new Animated.Value(0)).current;

    const animatePasswordInput = (show: boolean) => {
        console.log(`animatePasswordInput called with show: ${show}`);
        
        if (show) {
            setShowPassword(true);
            Animated.parallel([
                Animated.timing(passwordSlideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(passwordFadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonSlideAnim, {
                    toValue: isLoginMode ? 60 : 120, // Different heights for login vs signup
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            console.log('Starting hide animation...');
            Animated.parallel([
                Animated.timing(passwordSlideAnim, {
                    toValue: -50,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(passwordFadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonSlideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start((finished) => {
                console.log(`Hide animation finished: ${finished}`);
                if (finished) {
                    console.log('Resetting states...');
                    setShowPassword(false);
                    setIsLoginMode(false);
                    setPassword('');
                    setConfirmPassword('');
                    setShowPasswordText(false);
                    console.log('States reset successfully');
                }
            });
        }
    };

    const checkEmailExists = async (email: string): Promise<boolean> => {
        try {
            console.log('Checking if email exists via Firebase function:', email);
            const result = await checkEmailExistsFunction({ email });
            console.log('Firebase function result:', result.data);
            const exists = (result.data as { exists: boolean }).exists;
            console.log('Email exists:', exists);
            return exists;
        } catch (error) {
            console.error('Error checking email via Firebase function:', error);
            return false;
        }
    };

    const validatePasswords = () => {
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return false;
        }

        if (isLoginMode) {
            return true; // Only need one password for login
        }

        // For signup, validate both passwords
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }

        if (!confirmPassword.trim()) {
            Alert.alert('Error', 'Please confirm your password');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        return true;
    };

    const handleContinue = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (!showPassword) {
            // Check if email exists
            setLoading(true);
            try {
                const emailExists = await checkEmailExists(email);
                console.log('Email check result:', emailExists);
                
                if (emailExists) {
                    console.log('Setting login mode');
                    setIsLoginMode(true);
                } else {
                    console.log('Setting signup mode');
                    setIsLoginMode(false);
                }
                
                animatePasswordInput(true);
            } catch (error) {
                console.error('Error during email check:', error);
                Alert.alert('Error', 'Failed to verify email. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            // Handle login or signup
            if (!validatePasswords()) {
                return;
            }

            setLoading(true);
            try {
                if (isLoginMode) {
                    // Sign in existing user
                    console.log('Attempting to sign in user');
                    await signInWithEmailAndPassword(auth, email, password);
                    
                    // Store credentials for persistence
                    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify({
                        type: 'email',
                        email: email,
                        password: password, // Note: In production, consider using secure storage
                        timestamp: Date.now()
                    }));
                    
                    setGlobalAuthMethod('email');
                    console.log('Successfully signed in user');
                } else {
                    // Create new user
                    console.log('Attempting to create new user');
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    
                    // Update profile with display name (extract from email)
                    const displayName = email.split('@')[0];
                    await updateProfile(userCredential.user, {
                        displayName: displayName
                    });

                    // Store credentials for persistence
                    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify({
                        type: 'email',
                        email: email,
                        password: password, // Note: In production, consider using secure storage
                        timestamp: Date.now()
                    }));

                    // Call the Firebase Function to create user and assign coach
                    try {
                        const result = await createUser();
                        console.log('User creation result:', result.data);
                    } catch (error) {
                        console.error('Error calling createUser function:', error);
                    }
                    
                    setGlobalAuthMethod('email');
                    console.log('Successfully created new user');
                }
            } catch (error: any) {
                console.error('Authentication error:', error);
                let errorMessage = 'An error occurred. Please try again.';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password. Please try again.';
                        break;
                    case 'auth/email-already-in-use':
                        errorMessage = 'An account with this email already exists.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Please choose a stronger password.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address format.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Please try again later.';
                        break;
                    case 'auth/invalid-credential':
                        errorMessage = 'Invalid credentials. Please check your email and password.';
                        break;
                }
                
                Alert.alert('Authentication Error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };
  
    const handleGoogleLogin = async () => {
        if (Platform.OS === "web") {
            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            try {
                const result = await signInWithPopup(getAuth(), provider);
                const user = result.user;
                
                // Store Google credentials for persistence (need to get tokens differently for web)
                await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify({
                    type: 'google',
                    refreshToken: 'web_auth', // Web doesn't provide refresh tokens the same way
                    timestamp: Date.now()
                }));
                
                // Call the Firebase Function to create user and assign coach
                try {
                    const createResult = await createUser();
                    console.log('User creation result:', createResult.data);
                } catch (error) {
                    console.error('Error calling createUser function:', error);
                }
                
                setGlobalAuthMethod('google');
                console.log("Successfully signed in with Google");
            } catch (error) {
                console.error("Error signing in with Google:", error);
            }
        } else {
            try {
                // Check if user is already signed in and sign out to force account selection
                const currentUser = await GoogleSignin.getCurrentUser();
                if (currentUser) {
                    await GoogleSignin.signOut();
                }
                
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
                    
                    // Store Google credentials for persistence
                    await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify({
                        type: 'google',
                        refreshToken: tokens.accessToken, // Store refresh token for silent sign-in
                        timestamp: Date.now()
                    }));
                    
                    // Call the Firebase Function to create user and assign coach
                    try {
                        const result = await createUser();
                        console.log('User creation result:', result.data);
                    } catch (error) {
                        console.error('Error calling createUser function:', error);
                    }
                    
                    setGlobalAuthMethod('google');
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
                        case statusCodes.SIGN_IN_CANCELLED:
                            console.log("User cancelled sign in");
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

    const handleBack = () => {
        console.log('Back button pressed');
        if (showPassword) {
            console.log('Hiding password inputs...');
            animatePasswordInput(false);
        }
    };
  
    const handleAppleSignUp = () => {
      console.log('Continue with Apple');
    };

    const getButtonText = () => {
        if (loading) return 'Loading...';
        if (!showPassword) return 'Continue';
        return isLoginMode ? 'Sign In' : 'Create Account';
    };

    const getHeaderText = () => {
        if (!showPassword) return 'Create an account';
        return isLoginMode ? 'Welcome back!' : 'Create your account';
    };

    const getSubHeaderText = () => {
        if (!showPassword) return 'Enter your email to sign up for this app';
        return isLoginMode 
            ? 'Enter your password to sign in' 
            : 'Create a secure password for your account';
    };

    return (
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" backgroundColor="#fff" translucent={false} />
          
          {showPassword && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <FontAwesome name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>
          )}
          
          <View style={styles.logoContainer}>
            <Dumbell/>
            <Text style={styles.title}>GymMate+</Text>
          </View>
  
          <Text style={styles.header}>{getHeaderText()}</Text>
          <Text style={styles.subHeader}>{getSubHeaderText()}</Text>
  
          <View style={styles.inputContainer}>
            <TextInput
                style={[styles.input, showPassword && styles.inputDisabled]}
                placeholder="email@domain.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!showPassword}
            />
            
            {showPassword && (
              <Animated.View
                style={[
                  styles.passwordInput,
                  {
                    opacity: passwordFadeAnim,
                    transform: [{ translateY: passwordSlideAnim }],
                  },
                ]}
              >
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPasswordText}
                />
                
                {!isLoginMode && (
                  <TextInput
                      style={[styles.input, styles.confirmPasswordInput]}
                      placeholder="Confirm Password"
                      placeholderTextColor="#999"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPasswordText}
                  />
                )}
                
                <TouchableOpacity 
                  style={styles.showPasswordContainer}
                  onPress={() => setShowPasswordText(!showPasswordText)}
                >
                  <View style={styles.checkbox}>
                    {showPasswordText && (
                      <FontAwesome name="check" size={12} color="#007AFF" />
                    )}
                  </View>
                  <Text style={styles.showPasswordText}>Show password</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          <Animated.View
            style={[
              styles.submitButtonContainer,
              {
                transform: [{ translateY: buttonSlideAnim }],
              },
            ]}
          >
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.submitText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </Animated.View>

          {!showPassword && (
            <>
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
            </>
          )}
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
    backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      padding: 10,
    },
    inputContainer: {
      marginBottom: 20,
    },
    passwordInput: {
      marginTop: 16,
    },
    submitButtonContainer: {
      marginTop: 20,
    },
    submitButtonDisabled: {
      backgroundColor: '#ccc',
    },
    inputDisabled: {
      backgroundColor: '#f5f5f5',
      color: '#888',
    },
    confirmPasswordInput: {
      marginTop: 16,
    },
    showPasswordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      paddingLeft: 4,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    showPasswordText: {
      fontSize: 14,
      color: '#666',
    },
  });
  