import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/types/navigation';
import { MainButton } from '@/components/MainButton';
import { Container } from '@/components/Container';
import { Dumbell } from '@/components/Dumbell';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';
import CoachCalendar from './CoachCalendar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rir: string;
}

interface WorkoutDay {
    day: string;
    exercises: Exercise[];
}

type WorkoutProgram = WorkoutDay[];

// Default program template
const defaultProgram: WorkoutProgram = [
    {
        day: 'Monday',
        exercises: [
            { name: 'BB Back Squat', sets: 3, reps: '3-5', rir: '7-8' },
            { name: 'Bench Press', sets: 4, reps: '4-6', rir: '7-8' },
        ]
    },
    {
        day: 'Wednesday', 
        exercises: [
            { name: 'Deadlift', sets: 3, reps: '5', rir: '7-8' },
            { name: 'OHP', sets: 3, reps: '8', rir: '7-8' },
        ]
    },
    {
        day: 'Friday',
        exercises: [
            { name: 'Front Squat', sets: 3, reps: '8', rir: '7-8' },
            { name: 'Row', sets: 3, reps: '10', rir: '7-8' },
        ]
    }
];

interface DayCardProps {
    day: string;
    exercises: Exercise[];
}

const DayCard: React.FC<DayCardProps> = ({ day, exercises }) => (
    <View style={styles.dayCard}>
        <Text style={styles.dayTitle}>{day}</Text>
        {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseText}>{exercise.sets} set x {exercise.reps}</Text>
                    <Text style={styles.exerciseText}>RIR {exercise.rir}</Text>
                </View>
            </View>
        ))}
    </View>
);

const Calendar = () => {
    const navigation = useNavigation<NavigationProp>();
    const [program, setProgram] = useState<WorkoutProgram | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCoach, setIsCoach] = useState(false);

    useEffect(() => {
        checkUserAndLoadProgram();
    }, []);

    const checkUserAndLoadProgram = async () => {
        if (!auth.currentUser) return;

        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            const userData = userDoc.data();

            if (userData?.accountType === 'coach') {
                setIsCoach(true);
                setLoading(false);
                return;
            }

            // En son kaydedilen programı çek
            await loadLatestProgram();
        } catch (error) {
            console.error('Error loading program:', error);
            setProgram(defaultProgram);
        } finally {
            setLoading(false);
        }
    };

    const loadLatestProgram = async () => {
        try {
            if (!auth.currentUser) return;

            console.log('[DEBUG] En son programı yükleniyor...');
            console.log('[DEBUG] User ID:', auth.currentUser.uid);
            
            // Programs koleksiyonundan en son programı çek
            const programsRef = collection(firestore, 'users', auth.currentUser.uid, 'programs');
            const q = query(programsRef, orderBy('createdDate', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            console.log('[DEBUG] Query sonucu:', querySnapshot.size, 'program bulundu');

            if (!querySnapshot.empty) {
                const latestProgram = querySnapshot.docs[0].data();
                console.log('[DEBUG] Program bulundu:', latestProgram);
                console.log('[DEBUG] Program ID:', querySnapshot.docs[0].id);
                console.log('[DEBUG] Program içeriği:', latestProgram.program);
                console.log('[DEBUG] Program gün sayısı:', latestProgram.program?.length);
                setProgram(latestProgram.program || defaultProgram);
            } else {
                console.log('[DEBUG] Program bulunamadı, default program kullanılıyor');
                setProgram(defaultProgram);
            }
        } catch (error) {
            console.error('[DEBUG] Program yükleme hatası:', error);
            setProgram(defaultProgram);
        }
    };

    if (loading) {
        return (
            <Container>
                <Text>Loading program...</Text>
            </Container>
        );
    }

    if (isCoach) {
        return <CoachCalendar />;
    }

    if (!program) {
        return (
            <Container>
                <Text>No program found</Text>
            </Container>
        );
    }

    return (
        <Container style={styles.container}>
            <Text style={styles.title}>Weekly Program</Text>
            <ScrollView style={styles.scrollView}>
                {program.map(({ day, exercises }) => (
                    <DayCard key={day} day={day} exercises={exercises} />
                ))}
            </ScrollView>
        </Container>
    );
};

export default Calendar;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    dayCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    exerciseRow: {
        flexDirection: 'column',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },
    exerciseDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    exerciseText: {
        fontSize: 14,
        color: '#666',
    },
});
