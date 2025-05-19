import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

interface Trainee {
    id: string;
    displayName: string;
    program: WorkoutProgram;
}

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

const CoachCalendar = () => {
    const navigation = useNavigation();
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrainees = async () => {
        if (!auth.currentUser) return;

        try {
            const coachDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            const traineeIds = coachDoc.data()?.trainees || [];

            const traineeData: Trainee[] = [];
            for (const traineeId of traineeIds) {
                const traineeDoc = await getDoc(doc(firestore, 'users', traineeId));
                if (traineeDoc.exists()) {
                    traineeData.push({
                        id: traineeId,
                        displayName: traineeDoc.data().displayName || 'Unknown Trainee',
                        program: traineeDoc.data().program || defaultProgram,
                    });
                }
            }

            setTrainees(traineeData);
        } catch (error) {
            console.error('Error fetching trainees:', error);
            Alert.alert('Error', 'Failed to load trainees');
        } finally {
            setLoading(false);
        }
    };

    // Fetch trainees when the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchTrainees();
        }, [])
    );

    const handleEditProgram = (trainee: Trainee) => {
        navigation.navigate('ProgramEditor', {
            traineeId: trainee.id,
            traineeName: trainee.displayName,
            currentProgram: trainee.program,
        });
    };

    if (loading) {
        return (
            <Container>
                <Text>Loading trainees...</Text>
            </Container>
        );
    }

    return (
        <Container style={styles.container}>
            <Text style={styles.title}>My Trainees</Text>
            <ScrollView style={styles.scrollView}>
                {trainees.length === 0 ? (
                    <Text style={styles.noTraineesText}>No trainees assigned yet</Text>
                ) : (
                    trainees.map((trainee) => (
                        <TouchableOpacity
                            key={trainee.id}
                            style={styles.traineeCard}
                            onPress={() => handleEditProgram(trainee)}
                        >
                            <View style={styles.traineeInfo}>
                                <Text style={styles.traineeName}>{trainee.displayName}</Text>
                                <Text style={styles.programInfo}>
                                    {Object.keys(trainee.program).length} training days
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </Container>
    );
};

export default CoachCalendar;

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
    traineeCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    traineeInfo: {
        flex: 1,
    },
    traineeName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    programInfo: {
        fontSize: 14,
        color: '#666',
    },
    noTraineesText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 32,
    },
}); 