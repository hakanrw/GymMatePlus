import { auth } from '@/app/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, getFirestore, addDoc, collection, query, where, getDocs } from '@firebase/firestore';

interface WorkoutDay {
    day: string;
    exercises: {
        name: string;
        sets: number;
        reps: string;
        rir: string;
        weight?: number;
    }[];
}

interface WorkoutProgram {
    id: string;
    userId: string;
    name: string;
    createdDate: Date;
    program: WorkoutDay[];
    userInfo: {
        gender: string;
        experience: string;
        goal: string;
        workout_days: string;
    };
}

interface Exercise {
    id: string;
    name: string;
    area: string;
    description: string;
    instructions: string[];
    targetMuscles: string[];
    equipment: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    imageUrl?: string;
}

class ProgramService {
    private db = getFirestore();

    async saveWorkoutProgram(userInfo: any, program: WorkoutDay[]): Promise<string> {
        try {
            console.log('[DEBUG] saveWorkoutProgram başladı');
            console.log('[DEBUG] Gelen program gün sayısı:', program.length);
            
            // Deneyim seviyesini normalize et
            userInfo.experience = this.normalizeExperience(userInfo.experience || '');
            console.log('[DEBUG] UserInfo normalize edildi:', userInfo);

            // Programı kaydetmeden önce undefined alanları temizle ve validate et
            const cleanedProgram = program
                .filter(day => day && day.day && day.exercises && day.exercises.length > 0) // Geçerli günleri filtrele
                .map(day => ({
                    day: day.day || 'Gün',
                    exercises: (day.exercises || [])
                        .filter(ex => ex && ex.name && ex.sets && ex.reps && ex.rir) // Geçerli egzersizleri filtrele
                        .map(ex => ({
                            name: ex.name || 'Egzersiz',
                            sets: typeof ex.sets === 'number' ? ex.sets : (typeof ex.sets === 'string' ? parseInt(ex.sets) : 3) || 3,
                            reps: ex.reps || '8-12',
                            rir: ex.rir || '2-3'
                        }))
                }))
                .filter(day => day.exercises.length > 0); // Sadece egzersizi olan günleri al

            console.log('[DEBUG] Program temizlendi, temiz gün sayısı:', cleanedProgram.length);

            // Eğer temizleme sonrası program boşsa hata ver
            if (cleanedProgram.length === 0) {
                throw new Error('Program oluşturulamadı - geçerli egzersiz bulunamadı');
            }

            // UserInfo'yu da temizle
            const cleanedUserInfo = {
                gender: userInfo.gender || 'Belirtilmemiş',
                experience: userInfo.experience || 'başlangıç',
                goal: userInfo.goal || 'Genel fitness',
                workout_days: userInfo.workout_days || '3'
            };

            console.log('[DEBUG] UserInfo temizlendi:', cleanedUserInfo);

            const programData: Omit<WorkoutProgram, 'id'> = {
                userId: auth.currentUser?.uid || 'anonymous',
                name: `${cleanedUserInfo.goal} Programı`,
                createdDate: new Date(),
                program: cleanedProgram,
                userInfo: cleanedUserInfo
            };

            console.log('[DEBUG] Firebase\'e kaydedilecek data hazırlandı');
            console.log('[DEBUG] User ID:', programData.userId);
            console.log('[DEBUG] Program adı:', programData.name);

            // Firebase'e kaydet
            const docRef = await addDoc(collection(this.db, 'users', programData.userId, 'programs'), programData);
            console.log('[DEBUG] ✅ Firebase\'e başarıyla kaydedildi!');
            console.log('[DEBUG] Document ID:', docRef.id);
            console.log('[DEBUG] Firebase path: users/' + programData.userId + '/programs/' + docRef.id);
            
            return docRef.id;
        } catch (error) {
            console.error('[DEBUG] ❌ Firebase kaydetme hatası:', error);
            throw error;
        }
    }

    async getCurrentProgram(): Promise<WorkoutProgram | null> {
        try {
            if (!auth.currentUser) return null;

            const userDoc = await getDoc(doc(this.db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();
            
            if (!userData?.currentProgram) return null;

            const programDoc = await getDoc(
                doc(this.db, 'users', auth.currentUser.uid, 'programs', userData.currentProgram)
            );

            return programDoc.exists() ? programDoc.data() as WorkoutProgram : null;
        } catch (error) {
            console.error('Error getting current program:', error);
            return null;
        }
    }

    async generateProgramWithGemini(userInfo: any): Promise<WorkoutDay[]> {
        try {
            // Deneyim seviyesini normalize et
            userInfo.experience = this.normalizeExperience(userInfo.experience || '');
            // Call your Python Gemini AI API
            const response = await fetch('http://localhost:8000/generate-program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gender: userInfo.gender,
                    experience: userInfo.experience,
                    goal: userInfo.goal,
                    workout_days: userInfo.workout_days,
                    user_id: auth.currentUser?.uid
                })
            });

            if (response.ok) {
                const geminiProgram = await response.json();
                return this.formatGeminiResponse(geminiProgram);
            } else {
                console.log('Gemini API not available, using local generation');
                return this.createDetailedProgram(userInfo);
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            // Fallback to sophisticated local program generation
            return this.createDetailedProgram(userInfo);
        }
    }

    private formatGeminiResponse(geminiResponse: any): WorkoutDay[] {
        try {
            // Gemini'den gelen response'u parse et
            let parsedResponse;
            if (typeof geminiResponse === 'string') {
                parsedResponse = JSON.parse(geminiResponse);
            } else {
                parsedResponse = geminiResponse;
            }

            // Gemini'nin döndürdüğü format: { "program": [...] }
            if (parsedResponse && parsedResponse.program && Array.isArray(parsedResponse.program)) {
                return parsedResponse.program
                    .filter((day: any) => day && day.day && day.exercises && Array.isArray(day.exercises))
                    .map((day: any) => ({
                        day: day.day || 'Gün',
                        exercises: day.exercises
                            .filter((exercise: any) => exercise && exercise.name && exercise.sets && exercise.reps && exercise.rir)
                            .map((exercise: any) => ({
                                name: exercise.name || 'Egzersiz',
                                sets: typeof exercise.sets === 'number' ? exercise.sets : 
                                      (typeof exercise.sets === 'string' ? parseInt(exercise.sets) : 3) || 3,
                                reps: exercise.reps || "8-12",
                                rir: exercise.rir || "2-3"
                            }))
                    }))
                    .filter((day: any) => day.exercises.length > 0);
            }
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
        }
        
        // If response format is unexpected, return empty array
        console.log('Gemini response format unexpected, using fallback');
        return [];
    }

    private async createDetailedProgram(userInfo: any): Promise<WorkoutDay[]> {
        const { experience, goal, workout_days, gender } = userInfo;
        const days = parseInt(workout_days) || 3;

        if (experience === 'başlangıç') {
            return await this.createBeginnerProgram(days, goal, gender);
        } else if (experience === 'orta seviye') {
            return await this.createIntermediateProgram(days, goal, gender);
        } else {
            return await this.createAdvancedProgram(days, goal, gender);
        }
    }

    private async getExercisesByDifficulty(difficulty: string): Promise<Exercise[]> {
        try {
            const exercisesRef = collection(this.db, 'exercises');
            const q = query(exercisesRef, where('difficulty', '==', difficulty));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Exercise[];
        } catch (error) {
            console.error('Error fetching exercises:', error);
            return [];
        }
    }

    private async getExercisesByArea(area: string): Promise<Exercise[]> {
        try {
            const exercisesRef = collection(this.db, 'exercises');
            const q = query(exercisesRef, where('area', '==', area));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Exercise[];
        } catch (error) {
            console.error('Error fetching exercises:', error);
            return [];
        }
    }

    private async createBeginnerProgram(days: number, goal: string, gender: string): Promise<WorkoutDay[]> {
        const exercises = await this.getExercisesByDifficulty('Beginner');
        if (exercises.length === 0) {
            throw new Error('No exercises found for beginner level');
        }

        const baseProgram: WorkoutDay[] = [
            {
                day: "Gün 1 - Full Body",
                exercises: [
                    { name: exercises.find(e => e.name === "Squat")?.name || "Squat", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Bench Press")?.name || "Bench Press", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Bent-over Row")?.name || "Bent-over Row", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Overhead Press")?.name || "Overhead Press", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Plank")?.name || "Plank", sets: 3, reps: "30-60 sn", rir: "1-2" }
                ]
            },
            {
                day: "Gün 2 - Full Body",
                exercises: [
                    { name: exercises.find(e => e.name === "Deadlift")?.name || "Deadlift", sets: 3, reps: "5-8", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Dumbbell Press")?.name || "Dumbbell Press", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Lat Pulldown")?.name || "Lat Pulldown", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Leg Press")?.name || "Leg Press", sets: 3, reps: "12-15", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Bicep Curl")?.name || "Bicep Curl", sets: 3, reps: "10-15", rir: "0-1" }
                ]
            },
            {
                day: "Gün 3 - Full Body",
                exercises: [
                    { name: exercises.find(e => e.name === "Romanian Deadlift")?.name || "Romanian Deadlift", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Incline Dumbbell Press")?.name || "Incline Dumbbell Press", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Seated Row")?.name || "Seated Row", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Leg Curl")?.name || "Leg Curl", sets: 3, reps: "10-15", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Tricep Extension")?.name || "Tricep Extension", sets: 3, reps: "10-15", rir: "0-1" }
                ]
            }
        ];

        return baseProgram.slice(0, days);
    }

    private async createIntermediateProgram(days: number, goal: string, gender: string): Promise<WorkoutDay[]> {
        if (days <= 3) {
            return this.createBeginnerProgram(days, goal, gender);
        }

        const exercises = await this.getExercisesByDifficulty('Intermediate');
        if (exercises.length === 0) {
            throw new Error('No exercises found for intermediate level');
        }

        const program: WorkoutDay[] = [
            {
                day: "Gün 1 - Üst Gövde",
                exercises: [
                    { name: exercises.find(e => e.name === "Bench Press")?.name || "Bench Press", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Bent-over Row")?.name || "Bent-over Row", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Overhead Press")?.name || "Overhead Press", sets: 3, reps: "8-12", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Lat Pulldown")?.name || "Lat Pulldown", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Tricep Extension")?.name || "Tricep Extension", sets: 3, reps: "10-15", rir: "0-1" }
                ]
            },
            {
                day: "Gün 2 - Alt Gövde",
                exercises: [
                    { name: exercises.find(e => e.name === "Squat")?.name || "Squat", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Romanian Deadlift")?.name || "Romanian Deadlift", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Leg Press")?.name || "Leg Press", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Leg Curl")?.name || "Leg Curl", sets: 3, reps: "10-15", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Calf Raise")?.name || "Calf Raise", sets: 4, reps: "12-15", rir: "0-1" }
                ]
            },
            {
                day: "Gün 3 - Push",
                exercises: [
                    { name: exercises.find(e => e.name === "Incline Bench Press")?.name || "Incline Bench Press", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Overhead Press")?.name || "Overhead Press", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Lateral Raise")?.name || "Lateral Raise", sets: 3, reps: "10-15", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Tricep Pushdown")?.name || "Tricep Pushdown", sets: 3, reps: "10-15", rir: "0-1" },
                    { name: exercises.find(e => e.name === "Chest Fly")?.name || "Chest Fly", sets: 3, reps: "10-15", rir: "0-1" }
                ]
            },
            {
                day: "Gün 4 - Pull",
                exercises: [
                    { name: exercises.find(e => e.name === "Deadlift")?.name || "Deadlift", sets: 4, reps: "5-8", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Pull-up")?.name || "Pull-up", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Seated Row")?.name || "Seated Row", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Bicep Curl")?.name || "Bicep Curl", sets: 3, reps: "10-15", rir: "0-1" },
                    { name: exercises.find(e => e.name === "Face Pull")?.name || "Face Pull", sets: 3, reps: "12-15", rir: "0-1" }
                ]
            }
        ];

        return program.slice(0, days);
    }

    private async createAdvancedProgram(days: number, goal: string, gender: string): Promise<WorkoutDay[]> {
        const exercises = await this.getExercisesByDifficulty('Advanced');
        if (exercises.length === 0) {
            throw new Error('No exercises found for advanced level');
        }

        const program: WorkoutDay[] = [
            {
                day: "Gün 1 - Göğüs ve Triceps",
                exercises: [
                    { name: exercises.find(e => e.name === "Bench Press")?.name || "Bench Press", sets: 5, reps: "5-8", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Incline Bench Press")?.name || "Incline Bench Press", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Dumbbell Fly")?.name || "Dumbbell Fly", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Tricep Pushdown")?.name || "Tricep Pushdown", sets: 4, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Skull Crusher")?.name || "Skull Crusher", sets: 3, reps: "8-12", rir: "0-1" }
                ]
            },
            {
                day: "Gün 2 - Sırt ve Biceps",
                exercises: [
                    { name: exercises.find(e => e.name === "Deadlift")?.name || "Deadlift", sets: 5, reps: "3-5", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Pull-up")?.name || "Pull-up", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Bent-over Row")?.name || "Bent-over Row", sets: 4, reps: "6-10", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Bicep Curl")?.name || "Bicep Curl", sets: 4, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Hammer Curl")?.name || "Hammer Curl", sets: 3, reps: "8-12", rir: "0-1" }
                ]
            },
            {
                day: "Gün 3 - Bacaklar",
                exercises: [
                    { name: exercises.find(e => e.name === "Squat")?.name || "Squat", sets: 5, reps: "5-8", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Romanian Deadlift")?.name || "Romanian Deadlift", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Leg Press")?.name || "Leg Press", sets: 4, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Leg Extension")?.name || "Leg Extension", sets: 3, reps: "10-15", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Calf Raise")?.name || "Calf Raise", sets: 4, reps: "12-15", rir: "0-1" }
                ]
            },
            {
                day: "Gün 4 - Omuzlar",
                exercises: [
                    { name: exercises.find(e => e.name === "Overhead Press")?.name || "Overhead Press", sets: 5, reps: "5-8", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Lateral Raise")?.name || "Lateral Raise", sets: 4, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Front Raise")?.name || "Front Raise", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Face Pull")?.name || "Face Pull", sets: 3, reps: "12-15", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Shrug")?.name || "Shrug", sets: 3, reps: "10-15", rir: "0-1" }
                ]
            },
            {
                day: "Gün 5 - Kollar",
                exercises: [
                    { name: exercises.find(e => e.name === "Close Grip Bench Press")?.name || "Close Grip Bench Press", sets: 4, reps: "6-10", rir: "2-3" },
                    { name: exercises.find(e => e.name === "Tricep Pushdown")?.name || "Tricep Pushdown", sets: 4, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Bicep Curl")?.name || "Bicep Curl", sets: 4, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Hammer Curl")?.name || "Hammer Curl", sets: 3, reps: "8-12", rir: "1-2" },
                    { name: exercises.find(e => e.name === "Preacher Curl")?.name || "Preacher Curl", sets: 3, reps: "8-12", rir: "0-1" }
                ]
            }
        ];

        return program.slice(0, days);
    }

    private normalizeExperience(exp: string) {
        const e = exp.toLowerCase();
        if (e.includes('advanced') || e.includes('ileri')) return 'ileri seviye';
        if (e.includes('intermediate') || e.includes('orta')) return 'orta seviye';
        if (e.includes('beginner') || e.includes('başlangıç')) return 'başlangıç';
        return 'başlangıç';
    }
}

export default new ProgramService(); 