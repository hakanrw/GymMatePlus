import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
    projectId: 'plus-gymmate', // 👈 required here
    credential: applicationDefault(), // uses GOOGLE_APPLICATION_CREDENTIALS if set, or emulator in dev
});

const db = getFirestore();

const gyms = [
  {
    id: 1,
    name: "Yeditepe Fitness Center",
    address: "İnönü Mahallesi\nKayışdağı/Ataşehir\n34755",
    image: null,
    price: 999,
  },
  {
    id: 2,
    name: "Kayışdağı Fitness",
    address: "Atatürk Mahallesi\nAtaşehir/İstanbul\n34758",
    image: null,
    price: 799,
  },
  {
    id: 3,
    name: "Fitness+ Ultra Club",
    address: "Barbaros Mahallesi\nÜsküdar/İstanbul\n34662",
    image: null,
    price: 699,
  },
];

async function seed() {
  const batch = db.batch();
  gyms.forEach((gym) => {
    const ref = db.collection('gyms').doc(); // or use gym.id as ID
    batch.set(ref, gym);
  });
  await batch.commit();
  console.log("🏋️ Seeded gyms into Firestore.");
}

seed();
