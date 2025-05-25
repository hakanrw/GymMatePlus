import { initializeApp, cert } from 'firebase-admin/app';
import { seedExercises } from './seedExercises';

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'plus-gymmate'
});

// Run the seeding function
seedExercises()
  .then(() => {
    console.log('Exercise seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding exercises:', error);
    process.exit(1);
  }); 