import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { seedExercises } from './seedExercises';
import { seedGyms } from './seedGyms';

export async function seed() {
  seedExercises();
  seedGyms();
}

if (require.main === module) {
  initializeApp({
      projectId: 'plus-gymmate', // 👈 required here
      credential: applicationDefault(), // uses GOOGLE_APPLICATION_CREDENTIALS if set, or emulator in dev
  });

  seed();
}
