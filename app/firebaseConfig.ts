import { connectFirestoreEmulator, getFirestore } from '@firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from '@firebase/functions';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyAt4Kupdd1J6ki9yfhpHjVIZaA3FEItgKk",
    authDomain: "plus-gymmate.firebaseapp.com",
    projectId: "plus-gymmate",
    storageBucket: "plus-gymmate.firebasestorage.app",
    messagingSenderId: "714875913611",
    appId: "1:714875913611:web:58a1d2519c1bf565eddb8e",
    measurementId: "G-EJ0Z25PBYF"
};

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth - Firebase v9+ handles persistence automatically in React Native
const auth = getAuth(app);

// Only use emulators in development mode
if (__DEV__ && Platform.OS === "web" && false) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(getFirestore(app), 'localhost', 9299);
    connectFunctionsEmulator(getFunctions(app, 'europe-west1'), 'localhost', 5001)
}

export { app };
export { auth };
export const firestore = getFirestore(app);
export const functions = getFunctions(app, 'europe-west1');
