import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

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
    imageUrl: "https://example.com/bench-press.jpg"
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
    imageUrl: "https://example.com/bicep-curls.jpg"
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
    imageUrl: "https://example.com/squats.jpg"
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
    imageUrl: "https://example.com/treadmill.jpg"
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
    imageUrl: "https://example.com/push-ups.jpg"
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
    imageUrl: "https://example.com/hammer-curls.jpg"
  }
];

export async function seedExercises() {
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