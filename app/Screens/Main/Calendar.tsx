import React from 'react';
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
import { MainButton } from '@/components/MainButton';
import { Container } from '@/components/Container';
import { Dumbell } from '@/components/Dumbell';

interface Exercise {
    exercise: string;
    sets: string;
    rpe: string;
}

type WorkoutProgram = {
    [key: string]: Exercise[];
};

// Mock workout data structure
const workoutProgram: WorkoutProgram = {
    Monday: [
        { exercise: 'BB Back Squat', sets: '3x3-5', rpe: '7-8' },
        { exercise: 'Bench Press', sets: '4x4-6', rpe: '7-8' },
        { exercise: 'Smith Machine OHP', sets: '3x8-12', rpe: '8-10' },
        { exercise: 'Incline DB Press', sets: '3x8-12', rpe: '8-10' },
        { exercise: 'Cable Side Raise', sets: '3x10-15', rpe: '10' },
    ],
    Tuesday: [
        { exercise: 'Pause Deadlift', sets: '3x3', rpe: '7-8' },
        { exercise: 'Pull Ups', sets: '3x4-6', rpe: '7-9' },
        { exercise: 'Machine Row', sets: '3x8-12', rpe: '8-10' },
        { exercise: 'Rear Delt Fly', sets: '3x8-15', rpe: '10' },
        { exercise: 'Face-Away Curl', sets: '2x8-10', rpe: '10' },
    ],
    Wednesday: [
        { exercise: 'Front Squat', sets: '3x8-12', rpe: '7-9' },
        { exercise: 'Seated Leg Curl', sets: '3x10-15', rpe: '8-10' },
        { exercise: 'Leg Extension', sets: '3x10-15', rpe: '8-10' },
        { exercise: 'Back Extension', sets: '3x8-12', rpe: '8-10' },
        { exercise: 'Weighted Plank', sets: '3 sets', rpe: '10' },
    ],
    Thursday: [
        { exercise: 'BB OHP', sets: '4x4-6', rpe: '7-9' },
        { exercise: 'Bench Press', sets: '3x8-12', rpe: '7-8' },
        { exercise: 'DB Lateral Raise', sets: '3x10-15', rpe: '10' },
        { exercise: 'Machine Chest Fly', sets: '3x10-15', rpe: '10' },
        { exercise: 'Triceps Pushdown', sets: '2x10-15', rpe: '10' },
    ],
    Friday: [
        { exercise: 'Machine Row', sets: '3x8-12', rpe: '8-10' },
        { exercise: 'Lat Pulldown', sets: '3x8-12', rpe: '8-10' },
        { exercise: 'Face Pull', sets: '3x10-15', rpe: '10' },
        { exercise: 'Hammer Curl', sets: '2x10-15', rpe: '10' },
        { exercise: 'DB Skull Crusher', sets: '2x10-15', rpe: '10' },
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
    const navigation = useNavigation() as any;

    return (
        <Container style={styles.container}>
            <Text style={styles.title}>Weekly Program</Text>
            <ScrollView style={styles.scrollView}>
                {Object.entries(workoutProgram).map(([day, exercises]) => (
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
