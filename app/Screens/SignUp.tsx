import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { Dumbell } from '@/components/Dumbell';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';

function SignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    
    const handleContinue = () => {
    };
  
    const handleGoogleLogin = async () => {
        if (Platform.OS === "web") {
            signInWithPopup(getAuth(), new GoogleAuthProvider());
        }
        else {
            GoogleSignin.configure();
            try {
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();
                if (isSuccessResponse(response)) {
                    console.log("Success");
                } else {
                    // sign in was cancelled by user
                }
            } catch (error) {
                if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        // operation (eg. sign in) already in progress
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android only, play services not available or outdated
                        break;
                    default:
                        // some other error happened
                    }
                } else {
                    // an error that's not related to google sign in occurred
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
  