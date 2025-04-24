import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyDVI_lPO3kYfCJYzFKDoE2kvbsBkUktP9M',
    authDomain: 'mygymmate-6082a.firebaseapp.com',
    projectId: 'mygymmate-6082a',
    storageBucket: 'mygymmate-6082a.appspot.com',
    messagingSenderId: '76174759333',
    appId: '1:76174759333:web:0999e195bf90296b87c44c',
};

// ✅ Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
