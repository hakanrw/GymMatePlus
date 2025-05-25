// functions/src/index.ts
import { HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

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

export const selectGymAndPayment = onCall({ cors: true }, async (request) => {
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
  });

const exercises = [
  {
    name: "Bench Press",
    area: "Chest",
    description: "A compound exercise that primarily targets the chest muscles, along with the shoulders and triceps.",
    instructions: [
      "Lie flat on a bench with your feet firmly planted on the ground",
      "Grip the barbell with hands slightly wider than shoulder-width apart",
      "Lower the bar to your chest in a controlled manner",
      "Press the bar back up to the starting position",
      "Repeat for desired number of repetitions"
    ],
    targetMuscles: ["Pectoralis Major", "Anterior Deltoids", "Triceps"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    imageUrl: ""
  },
  {
    name: "Bicep Curls",
    area: "Biceps",
    description: "An isolation exercise that targets the bicep muscles in the upper arm.",
    instructions: [
      "Stand with feet shoulder-width apart, holding dumbbells at your sides",
      "Keep your elbows close to your torso",
      "Curl the weights up towards your shoulders",
      "Squeeze your biceps at the top of the movement",
      "Lower the weights back down in a controlled manner"
    ],
    targetMuscles: ["Biceps Brachii", "Brachialis"],
    equipment: "Dumbbells",
    difficulty: "Beginner",
    imageUrl: ""
  },
  {
    name: "Squats",
    area: "Glutes",
    description: "A fundamental compound exercise that targets the glutes, quadriceps, and hamstrings.",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body by bending at the hips and knees",
      "Keep your chest up and back straight",
      "Descend until your thighs are parallel to the floor",
      "Push through your heels to return to starting position"
    ],
    targetMuscles: ["Gluteus Maximus", "Quadriceps", "Hamstrings"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    imageUrl: ""
  },
  {
    name: "Treadmill Running",
    area: "Cardio",
    description: "A cardiovascular exercise that improves heart health and burns calories.",
    instructions: [
      "Start with a 5-minute warm-up walk",
      "Gradually increase speed to a comfortable running pace",
      "Maintain good posture with arms swinging naturally",
      "Keep a steady breathing rhythm",
      "Cool down with a 5-minute walk"
    ],
    targetMuscles: ["Cardiovascular System", "Legs", "Core"],
    equipment: "Treadmill",
    difficulty: "Beginner",
    imageUrl: ""
  },
  {
    name: "Push-ups",
    area: "Chest",
    description: "A bodyweight exercise that targets the chest, shoulders, and triceps.",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulders",
      "Keep your body in a straight line from head to heels",
      "Lower your chest towards the ground",
      "Push back up to the starting position",
      "Maintain core engagement throughout the movement"
    ],
    targetMuscles: ["Pectoralis Major", "Anterior Deltoids", "Triceps", "Core"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    imageUrl: ""
  },
  {
    name: "Hammer Curls",
    area: "Biceps",
    description: "A variation of bicep curls that targets the biceps and forearms with a neutral grip.",
    instructions: [
      "Hold dumbbells with a neutral grip (palms facing each other)",
      "Keep elbows close to your sides",
      "Curl the weights up without rotating your wrists",
      "Squeeze at the top of the movement",
      "Lower the weights back down slowly"
    ],
    targetMuscles: ["Biceps Brachii", "Brachialis", "Brachioradialis"],
    equipment: "Dumbbells",
    difficulty: "Beginner",
    imageUrl: ""
  }
];

export const seedExercises = onRequest(async (request, response) => {
  try {
    const batch = db.batch();
    
    exercises.forEach((exercise) => {
      const ref = db.collection('exercises').doc();
      batch.set(ref, exercise);
    });
    
    await batch.commit();
    logger.info("🏋️ Seeded exercises into Firestore.");
    
    response.json({ 
      success: true, 
      message: "Exercises seeded successfully!",
      count: exercises.length 
    });
  } catch (error) {
    logger.error("Error seeding exercises:", error);
    response.status(500).json({ 
      success: false, 
      error: "Failed to seed exercises" 
    });
  }
});