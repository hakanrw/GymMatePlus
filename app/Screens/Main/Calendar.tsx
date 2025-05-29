import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, CalendarStackParamList } from '@/app/types/navigation';
import { MainButton } from '@/components/MainButton';
import { Container } from '@/components/Container';
import { Dumbell } from '@/components/Dumbell';
import { doc, getDoc, collection, query, where, orderBy, getDocs, onSnapshot } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';
import CoachCalendar from './CoachCalendar';
import AdminPanel from './AdminPanel';
import { FontAwesome } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<CalendarStackParamList>;

interface Exercise {
    exercise: string;
    sets: string;
    rpe: string;
}

interface FirebaseExercise {
    id: string;
    name: string;
    area: string;
    imageUrl?: string;
    difficulty: string;
    equipment: string;
}

type WorkoutProgram = {
    [key: string]: Exercise[];
};

// Default program template
const defaultProgram: WorkoutProgram = {
    Monday: [
        { exercise: 'Squats', sets: '3x8-10', rpe: '7-8' },
        { exercise: 'Bench Press', sets: '4x6-8', rpe: '7-8' },
        { exercise: 'Bicep Curls', sets: '3x10-12', rpe: '6-7' },
    ],
    Wednesday: [
        { exercise: 'Squats', sets: '3x5', rpe: '8-9' },
        { exercise: 'Push-ups', sets: '3x8-12', rpe: '7-8' },
        { exercise: 'Hammer Curls', sets: '3x10', rpe: '6-7' },
    ],
    Friday: [
        { exercise: 'Bench Press', sets: '3x8', rpe: '7-8' },
        { exercise: 'Squats', sets: '3x10', rpe: '6-7' },
        { exercise: 'Treadmill Running', sets: '20 min', rpe: '6-7' },
    ],
};

interface DayCardProps {
    day: string;
    exercises: Exercise[];
    exerciseDetails: { [key: string]: FirebaseExercise };
    onExercisePress: (exerciseId: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, exercises, exerciseDetails, onExercisePress }) => (
    <View style={styles.dayCard}>
        <Text style={styles.dayTitle}>{day}</Text>
        {exercises.map((exercise, index) => {
            const exerciseDetail = exerciseDetails[exercise.exercise];
            return (
                <View key={index} style={styles.exerciseRow}>
                    <View style={styles.exerciseHeader}>
                        {/* Exercise Image */}
                        <View style={styles.exerciseImageContainer}>
                            {exerciseDetail?.imageUrl ? (
                                <Image 
                                    source={{ uri: exerciseDetail.imageUrl }} 
                                    style={styles.exerciseImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <FontAwesome name="heart" size={16} color="#ccc" />
                                </View>
                            )}
                        </View>
                        
                        {/* Exercise Name - Clickable */}
                        <TouchableOpacity 
                            style={styles.exerciseNameContainer}
                            onPress={() => exerciseDetail && onExercisePress(exerciseDetail.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.exerciseName, exerciseDetail && styles.clickableExerciseName]}>
                                {exercise.exercise}
                            </Text>
                            {exerciseDetail && (
                                <FontAwesome name="chevron-right" size={12} color="#007AFF" style={styles.chevronIcon} />
                            )}
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.exerciseDetails}>
                        <Text style={styles.exerciseText}>{exercise.sets}</Text>
                        <Text style={styles.exerciseText}>RPE {exercise.rpe}</Text>
                    </View>
                </View>
            );
        })}
    </View>
);

const Calendar = () => {
    const navigation = useNavigation<NavigationProp>();
    const [program, setProgram] = useState<WorkoutProgram | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCoach, setIsCoach] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [exerciseDetails, setExerciseDetails] = useState<{ [key: string]: FirebaseExercise }>({});

    useEffect(() => {
        checkUserAndLoadProgram();
    }, []);

    const checkUserAndLoadProgram = async () => {
        if (!auth.currentUser) return;

        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            const userData = userDoc.data();

            // Check if user is admin first
            if (userData?.accountType === 'admin') {
                setIsAdmin(true);
                setLoading(false);
                return;
            }

            // Then check if user is coach
            if (userData?.accountType === 'coach') {
                setIsCoach(true);
                setLoading(false);
                return;
            }

            // Set up real-time listener for program updates for regular users
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
            const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                try {
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        const userProgram = userData?.program || defaultProgram;
                        setProgram(userProgram);
                        
                        // Fetch exercise details for all exercises in the program
                        fetchExerciseDetails(userProgram);
                    } else {
                        setProgram(defaultProgram);
                        fetchExerciseDetails(defaultProgram);
                    }
                } catch (error) {
                    console.error('Error processing program update:', error);
                    setProgram(defaultProgram);
                    fetchExerciseDetails(defaultProgram);
                } finally {
                    setLoading(false);
                }
            }, (error) => {
                console.error('Error listening to program updates:', error);
                setProgram(defaultProgram);
                fetchExerciseDetails(defaultProgram);
                setLoading(false);
            });

            // Cleanup function
            return () => unsubscribe();

        } catch (error) {
            console.error('Error setting up program listener:', error);
            setProgram(defaultProgram);
            await fetchExerciseDetails(defaultProgram);
            setLoading(false);
        }
    };

    const fetchExerciseDetails = async (program: WorkoutProgram) => {
        try {
            // Get all unique exercise names from the program
            const exerciseNames = new Set<string>();
            Object.values(program).forEach(dayExercises => {
                dayExercises.forEach(exercise => {
                    exerciseNames.add(exercise.exercise);
                });
            });

            // Fetch exercise details from Firebase
            const exercisesRef = collection(firestore, 'exercises');
            const exerciseDetailsMap: { [key: string]: FirebaseExercise } = {};

            // Query for each exercise name
            for (const exerciseName of exerciseNames) {
                const q = query(exercisesRef, where('name', '==', exerciseName));
                const querySnapshot = await getDocs(q);
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    exerciseDetailsMap[exerciseName] = {
                        id: doc.id,
                        name: data.name,
                        area: data.area,
                        imageUrl: data.imageUrl,
                        difficulty: data.difficulty,
                        equipment: data.equipment,
                    };
                });
            }

            setExerciseDetails(exerciseDetailsMap);
        } catch (error) {
            console.error('Error fetching exercise details:', error);
        }
    };

    const handleExercisePress = (exerciseId: string) => {
        navigation.navigate('ExerciseDetail', { exerciseId });
    };

    if (loading) {
        return (
            <Container style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading program...</Text>
            </Container>
        );
    }

    if (isAdmin) {
        return <AdminPanel />;
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

    const dayOrder = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ];

    return (
        <Container style={styles.container}>
            <Text style={styles.title}>Weekly Program</Text>
            <ScrollView style={styles.scrollView}>                
                {Object.entries(program)
                .sort(([dayA], [dayB]) => dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB))
                .map(([day, exercises]) => (
                    <DayCard 
                    key={day} 
                    day={day} 
                    exercises={exercises} 
                    exerciseDetails={exerciseDetails}
                    onExercisePress={handleExercisePress}
                    />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
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
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    exerciseImageContainer: {
        marginRight: 12,
    },
    exerciseImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    exerciseNameContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        flex: 1,
    },
    clickableExerciseName: {
        color: '#007AFF',
    },
    chevronIcon: {
        marginLeft: 8,
    },
    exerciseDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 52, // Align with exercise name (40px image + 12px margin)
    },
    exerciseText: {
        fontSize: 14,
        color: '#666',
    },
});
