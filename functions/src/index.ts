// functions/src/index.ts
import { HttpsError, onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onCall } from 'firebase-functions/v2/https';
import { seed } from './seed/seed';

initializeApp();
const db = getFirestore();

// Optional: Set default region
setGlobalOptions({ region: 'europe-west1' }); // or your preferred region

const allowedGoalSets = [
  'Lose Weight', 'Build Muscle', 'Improve Endurance', 'Flexibility/Mobility', 'General Fitness/Health',
];

const allowedDifficulties = [
  'Easy', 'Medium', 'Hard'
];

function isValidGoals(goals: string[]): boolean {
  return goals.every(goal => allowedGoalSets.includes(goal));
}

function isValidDifficulty(diff: string): boolean {
    return allowedDifficulties.includes(diff);
}
  
export const submitUserProfile = onCall(
  { cors: true }, // allow CORS if called from frontend
  async (request) => {
    try {
      const uid = request.auth?.uid;
      console.log("Processing request for user:", uid);

      if (!uid) {
        throw new HttpsError('unauthenticated', 'User must be authenticated.');
      }

      const { weight, height, sex, dateOfBirth, fitnessGoals, difficulty } = request.data;
      console.log("Received profile data:", { weight, height, sex, dateOfBirth, fitnessGoals, difficulty });

      if (
        weight == null ||
        height == null ||
        sex == null ||
        dateOfBirth == null ||
        fitnessGoals == null ||
        difficulty == null
      ) {
        throw new HttpsError('invalid-argument', 'Missing required fields.');
      }

      if (
        typeof weight !== 'number' ||
        typeof height !== 'number' ||
        typeof sex !== 'string' ||
        typeof dateOfBirth !== 'string' ||
        !Array.isArray(fitnessGoals) ||
        typeof difficulty !== 'string'
      ) {
        throw new HttpsError('invalid-argument', 'One or more fields have incorrect types.');
      }

      if (!isValidGoals(fitnessGoals)) {
        throw new HttpsError('invalid-argument', 'Invalid fitness goals.');
      }

      if (!isValidDifficulty(difficulty)) {
        throw new HttpsError('invalid-argument', 'Invalid difficulty.');
      }

      try {
        // Get the user's auth data
        console.log("Fetching user record from Auth...");
        const userRecord = await getAuth().getUser(uid);
        console.log("Got user record:", {
          displayName: userRecord.displayName,
          email: userRecord.email,
          photoURL: userRecord.photoURL
        });

        // Prepare the data to set
        interface UserData {
            displayName?: string;
            email?: string;
            photoURL?: string;
            createdAt: Date;
            weight: number;
            height: number;
            sex: string;
            dateOfBirth: string;
            fitnessGoals: string[];
            difficulty: string;
            onBoardingComplete: boolean;
            gym: number | null;
            accountType?: string;
        }

        const userData: UserData = {
          // Auth data - only include fields that are not null/undefined
          ...(userRecord.displayName && { displayName: userRecord.displayName }),
          ...(userRecord.email && { email: userRecord.email }),
          ...(userRecord.photoURL && { photoURL: userRecord.photoURL }),
          createdAt: new Date(),
          
          // Profile data
          weight,
          height,
          sex,
          dateOfBirth,
          fitnessGoals,
          difficulty,
          onBoardingComplete: true,
          gym: null,
        };

        // Get existing user data to preserve accountType
        const existingUserDoc = await db.collection('users').doc(uid).get();
        const existingData = existingUserDoc.data();
        
        // Merge with existing accountType or default to 'user'
        userData.accountType = existingData?.accountType || 'user';

        console.log("Attempting to update Firestore document with data:", userData);
        
        // Set all user data including auth data
        await db.collection('users').doc(uid).set(userData, { merge: true });
        console.log("Successfully updated user document");

        return { success: true };
      } catch (error: any) {
        console.error("Error in user data operations:", error);
        throw new HttpsError('internal', `Error updating user profile: ${error?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Top level error in submitUserProfile:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Unexpected error: ${error?.message || 'Unknown error'}`);
    }
  }
);

export const selectGymAndPayment = onCall(
  { cors: true }, async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { gym, paymentInfo } = request.data;

    if (gym == null || paymentInfo == null) {
      throw new HttpsError('invalid-argument', 'Missing gym or paymentInfo.');
    }

    if (typeof paymentInfo !== 'string') {
        throw new HttpsError('invalid-argument', 'Payment info must be a valid string.');
      }

    if (typeof gym !== 'number') {
      throw new HttpsError('invalid-argument', 'Gym must be a number.');
    }

    // 🔍 Check if gym exists by querying /gyms where id == gym
    const gymQuery = await db.collection('gyms').where('id', '==', gym).limit(1).get();

    if (gymQuery.empty) {
      throw new HttpsError('not-found', `Gym with id ${gym} not found.`);
    }

    // ✅ Update user's gym and payment info
    await db.collection('users').doc(uid).update({
      gym
    });

    return { success: true };
  }
);

export const seedFitnessData = onCall(
  { cors: true },
  async (request) => {
    try {
      const uid = request.auth?.uid;
      if (!uid) {
        throw new HttpsError('unauthenticated', 'User must be authenticated.');
      }

      // Sample weight data for the last 30 days
      const sampleData = [];
      const now = new Date();
      
      // Weight data - gradual decrease over time
      for (let i = 30; i >= 0; i -= 3) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const weight = 75 - (30 - i) * 0.1; // Gradual weight loss
        sampleData.push({
          userId: uid,
          type: 'weight',
          value: Math.round(weight * 10) / 10,
          date: date
        });
      }

      // Add all sample data to Firestore
      const batch = db.batch();
      sampleData.forEach(data => {
        const docRef = db.collection('fitnessData').doc();
        batch.set(docRef, data);
      });
      
      await batch.commit();
      
      return { 
        success: true, 
        message: `Added ${sampleData.length} sample weight entries` 
      };
    } catch (error: any) {
      console.error('Error seeding fitness data:', error);
      throw new HttpsError('internal', `Error seeding fitness data: ${error?.message || 'Unknown error'}`);
    }
  }
);

export const seedExercises = onRequest(
  {cors: true}, async (req, res) => {
    await seed();

    res.json({ 
      success: true, 
      message: "Exercises seeded successfully!",
    });
  }
);
