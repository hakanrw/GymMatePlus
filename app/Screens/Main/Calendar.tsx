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
import { doc, getDoc } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';
import CoachCalendar from './CoachCalendar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Exercise {
    exercise: string;
    sets: string;
    rpe: string;
}

type WorkoutProgram = {
    [key: string]: Exercise[];
};

// Default program template
const defaultProgram: WorkoutProgram = {
    Monday: [
        { exercise: 'BB Back Squat', sets: '3x3-5', rpe: '7-8' },
        { exercise: 'Bench Press', sets: '4x4-6', rpe: '7-8' },
    ],
    Wednesday: [
        { exercise: 'Deadlift', sets: '3x5', rpe: '7-8' },
        { exercise: 'OHP', sets: '3x8', rpe: '7-8' },
    ],
    Friday: [
        { exercise: 'Front Squat', sets: '3x8', rpe: '7-8' },
        { exercise: 'Row', sets: '3x10', rpe: '7-8' },
    ],
};

interface DayCardProps {
    day: string;
    exercises: Exercise[];
}

const DayCard: React.FC<DayCardProps> = ({ day, exercises }) => (
    <View style={styles.dayCard}>
        <Text style={styles.dayTitle}>{day}</Text>
        {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{exercise.exercise}</Text>
                <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseText}>{exercise.sets}</Text>
                    <Text style={styles.exerciseText}>RPE {exercise.rpe}</Text>
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

            setProgram(userData?.program || defaultProgram);
        } catch (error) {
            console.error('Error loading program:', error);
        } finally {
            setLoading(false);
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
                {Object.entries(program).map(([day, exercises]) => (
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
