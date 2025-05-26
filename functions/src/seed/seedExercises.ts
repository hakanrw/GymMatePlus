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
    imageUrl: "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/workout/deadlift.jpg"
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
    imageUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lat-pulldown.jpg"
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
    imageUrl: "https://cdn.shopify.com/s/files/1/0024/9803/5810/files/overhead-press.jpg"
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
    imageUrl: "https://www.verywellfit.com/thmb/wzySleAzEIQrFqWwNE3pLFCfd0A=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Verywell-08-3567190-LegPressGIF-36c7a3d381db4a0ab383f0fce5c1e9f0.gif"
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
    imageUrl: "https://media1.popsugar-assets.com/files/thumbor/GHhscf7qxV6XrGckLOdxRfjwzJE/fit-in/728xorig/filters:format_auto-!!-:strip_icc-!!-/2021/08/30/798/n/1922729/5c8011b7c3eccc02_Forearm_Plank/i/Forearm-Plank.jpg"
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
    imageUrl: "https://i.pinimg.com/originals/93/5e/e0/935ee04c64f109fc07e521fa8e1c6812.jpg"
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
    imageUrl: "https://cdn-ami-drupal.heartyhosting.com/sites/muscleandfitness.com/files/media/dips-triceps-main.jpg"
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
    imageUrl: "https://www.inspireusafoundation.org/wp-content/uploads/2023/01/russian-twist.gif"
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
    imageUrl: "https://cdn.muscleandstrength.com/sites/default/files/seated-cable-row.jpg"
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
    imageUrl: "https://www.verywellfit.com/thmb/MR1RwNhsdyO0J5cLLzA-LGJTW7k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Verywell-08-3567190-MountainClimbersGIF-533024a4d6f149aa873d53729062ed00.gif"
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