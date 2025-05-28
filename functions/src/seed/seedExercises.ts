import { applicationDefault, initializeApp } from 'firebase-admin/app';
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
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fbench-press.webp?alt=media&token=f519842b-d240-4bbf-990f-74c6f10dd499"
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
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fbicep-curls.jpg?alt=media&token=f675eac5-94c1-4d7d-aed4-1328776f778a"
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
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fsquats.webp?alt=media&token=d2892473-7980-4216-b92a-d7ac9fc18732"
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
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Ftreadmill-running.webp?alt=media&token=fee181c0-b734-4332-998b-fd07aaa4cbd7"
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
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fpush-ups.jpg?alt=media&token=b3a7bad2-9bef-42bc-bcf6-9d23d3740809"
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
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fhammer-curls.jpg?alt=media&token=adbc8b7e-ff68-42b8-98ea-d99801deb060"
  },
  {
      name: "Deadlift",
      area: "Back",
      description: "A compound movement that targets the posterior chain, especially the back, glutes, and hamstrings.",
      instructions: [
          "Stand with feet hip-width apart, barbell over the midfoot",
          "Bend at the hips and knees to grip the bar just outside the knees",
          "Keep your back straight and chest up",
          "Lift the bar by straightening hips and knees together",
          "Lower the bar to the ground with control"
      ],
      targetMuscles: ["Erector Spinae", "Gluteus Maximus", "Hamstrings"],
      equipment: "Barbell",
      difficulty: "Advanced",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fdeadlift.webp?alt=media&token=4a4d3dde-6338-498d-a900-412d38626060"
  },
  {
      name: "Lat Pulldown",
      area: "Back",
      description: "An isolation exercise that primarily targets the latissimus dorsi muscles.",
      instructions: [
          "Sit down at a lat pulldown machine and grab the bar with a wide grip",
          "Pull the bar down toward your chest while squeezing your shoulder blades",
          "Pause briefly at the bottom",
          "Slowly return the bar to the starting position",
          "Repeat for desired reps"
      ],
      targetMuscles: ["Latissimus Dorsi", "Biceps", "Rhomboids"],
      equipment: "Cable Machine",
      difficulty: "Beginner",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Flat_pulldown.jpg?alt=media&token=7431572f-bc23-4cae-ac48-16b1cc30bc4a"
  },
  {
      name: "Overhead Press",
      area: "Shoulders",
      description: "A compound pressing movement that targets the shoulder muscles and triceps.",
      instructions: [
          "Stand with feet shoulder-width apart holding a barbell at shoulder height",
          "Brace your core and press the bar overhead",
          "Lock your elbows at the top and avoid leaning back",
          "Lower the bar back to shoulder height in control",
          "Repeat"
      ],
      targetMuscles: ["Deltoids", "Triceps", "Upper Chest"],
      equipment: "Barbell",
      difficulty: "Intermediate",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Foverhead-press.jpg?alt=media&token=7511f80d-fe1b-41d7-af96-0b093c770024"
  },
  {
      name: "Leg Press",
      area: "Legs",
      description: "A machine-based lower body exercise that targets the quadriceps, hamstrings, and glutes.",
      instructions: [
          "Sit on the leg press machine with feet shoulder-width on the platform",
          "Push the platform away by extending your legs",
          "Do not lock your knees at the top",
          "Lower the platform slowly until your knees are at 90 degrees",
          "Push back up to starting position"
      ],
      targetMuscles: ["Quadriceps", "Gluteus Maximus", "Hamstrings"],
      equipment: "Leg Press Machine",
      difficulty: "Intermediate",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fleg-pres.webp?alt=media&token=53a3850e-8267-42d4-b99d-b9d530e14c36"
  },
  {
      name: "Plank",
      area: "Core",
      description: "An isometric core exercise that strengthens abdominal and back muscles.",
      instructions: [
          "Start in a forearm plank position",
          "Keep your body in a straight line from head to heels",
          "Engage your core and glutes",
          "Avoid letting your hips drop or rise too high",
          "Hold the position for as long as possible"
      ],
      targetMuscles: ["Rectus Abdominis", "Transverse Abdominis", "Lower Back"],
      equipment: "Bodyweight",
      difficulty: "Beginner",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fplank.jpg?alt=media&token=e05e7456-5700-4dcc-ac98-43da6815bcc5"
  },
  {
      name: "Dumbbell Lunges",
      area: "Legs",
      description: "A unilateral leg exercise that targets quads, hamstrings, and glutes.",
      instructions: [
          "Stand upright holding a dumbbell in each hand",
          "Step forward with one leg and lower your body until both knees are bent at 90 degrees",
          "Push off the front leg to return to standing",
          "Alternate legs and repeat"
      ],
      targetMuscles: ["Quadriceps", "Gluteus Maximus", "Hamstrings"],
      equipment: "Dumbbells",
      difficulty: "Intermediate",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fdumbell-lunge.png?alt=media&token=2eb33499-df6a-43bc-b813-58b2b17093e2"
  },
  {
      name: "Tricep Dips",
      area: "Triceps",
      description: "A bodyweight exercise that effectively targets the triceps using parallel bars or a bench.",
      instructions: [
          "Position your hands behind you on a bench or dip bars",
          "Lower your body by bending your elbows to about 90 degrees",
          "Keep your back close to the bench or bars",
          "Push yourself back up to the starting position",
          "Repeat"
      ],
      targetMuscles: ["Triceps Brachii", "Shoulders", "Chest"],
      equipment: "Bodyweight or Parallel Bars",
      difficulty: "Intermediate",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Ftricep-dips.webp?alt=media&token=198b19f4-44c7-46e6-b06a-43c89d830c07"
  },
  {
      name: "Russian Twists",
      area: "Core",
      description: "A rotational abdominal exercise that targets the obliques and entire core.",
      instructions: [
          "Sit on the floor with knees bent and feet slightly lifted",
          "Hold a weight or medicine ball with both hands",
          "Lean back slightly and twist your torso to each side",
          "Touch the weight to the ground on each side",
          "Continue alternating sides"
      ],
      targetMuscles: ["Obliques", "Rectus Abdominis"],
      equipment: "Medicine Ball or Dumbbell",
      difficulty: "Intermediate",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Frussian-twist.jpg?alt=media&token=4e7a1464-df93-49e0-a065-53e4c65e4581"
  },
  {
      name: "Seated Row",
      area: "Back",
      description: "A cable machine exercise that targets the middle back muscles through horizontal pulling.",
      instructions: [
          "Sit at the machine with feet on the platform and grab the handles",
          "Pull the handles toward your torso while squeezing your shoulder blades together",
          "Keep your chest upright and elbows close to the body",
          "Slowly extend your arms to return to start",
          "Repeat"
      ],
      targetMuscles: ["Rhomboids", "Latissimus Dorsi", "Trapezius"],
      equipment: "Cable Machine",
      difficulty: "Beginner",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fseated-row.jpg?alt=media&token=75717383-df3d-4051-82e8-1dc4484b07ec"
  },
  {
      name: "Mountain Climbers",
      area: "Cardio",
      description: "A high-intensity bodyweight exercise that boosts heart rate and strengthens the core.",
      instructions: [
          "Start in a push-up position with arms fully extended",
          "Drive one knee toward your chest",
          "Quickly switch legs, simulating a running motion",
          "Keep your hips low and core engaged",
          "Continue alternating knees rapidly"
      ],
      targetMuscles: ["Core", "Legs", "Shoulders"],
      equipment: "Bodyweight",
      difficulty: "Intermediate",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/plus-gymmate.firebasestorage.app/o/excercise%2Fmountain-climbers.png?alt=media&token=0caa6f94-09f9-4a54-acb9-c738275d857c"
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

if (require.main === module) {
  initializeApp({
      projectId: 'plus-gymmate', // 👈 required here
      credential: applicationDefault(), // uses GOOGLE_APPLICATION_CREDENTIALS if set, or emulator in dev
  });

  seedExercises();
}
