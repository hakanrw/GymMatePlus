import { getFirestore } from 'firebase-admin/firestore';

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
    imageUrl: "https://cdn.mos.cms.futurecdn.net/pLaRi5jXSHDKu6WRydetBo-650-80.jpg.webp"
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
    imageUrl: "https://hips.hearstapps.com/hmg-prod/images/dumbbell-workout-royalty-free-image-1703068569.jpg"
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
    imageUrl: "https://media.glamourmagazine.co.uk/photos/6138a5b2236c41e831489fec/16:9/w_2240,c_limit/gettyimages-1219540136_sf.jpg"
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
    imageUrl: "https://cdn.prod.website-files.com/667e874f45b06e6a2960bd2e/678cc2edf00c3325b4efa626_enjoy-treadmill-runs.webp"
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
    imageUrl: "https://www.formlakal.com/wp-content/uploads/2023/10/wsi-imageoptim-0-Push-Up-Hareketi-Nasil-Yapilir_.jpg"
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
    imageUrl: "https://www.shape.com/thmb/zM_afeI7D3spw4da9OqU4-KDGR0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/hammer-curls-form-5c6c9cfb28f34c8e97cd64812156a9d1.jpg"
  }
];

export async function seedExercises() {
  const db = getFirestore();

  const batch = db.batch();
  
  exercises.forEach((exercise) => {
    const ref = db.collection('exercises').doc();
    batch.set(ref, exercise);
  });
  
  await batch.commit();
  console.log("🏋️ Seeded exercises into Firestore.");
}

// Run this function to seed the data
// seedExercises().catch(console.error); 