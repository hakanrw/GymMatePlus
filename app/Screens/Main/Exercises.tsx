import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { collection, getDocs } from '@firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import { HomeStackParamList } from '@/app/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Exercises'>;

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

const Exercises = () => {
    const navigation = useNavigation<NavigationProp>();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const exercisesRef = collection(firestore, 'exercises');
            const querySnapshot = await getDocs(exercisesRef);
            
            const exercisesList: Exercise[] = [];
            querySnapshot.forEach((doc) => {
                exercisesList.push({
                    id: doc.id,
                    ...doc.data()
                } as Exercise);
            });

            setExercises(exercisesList);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            setError('Failed to load exercises. Please try again later.');
            setLoading(false);
        }
    };

    const handleExercisePress = (exerciseId: string) => {
        navigation.navigate('ExerciseDetail', { exerciseId });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return '#4CAF50';
            case 'Intermediate': return '#FF9800';
            case 'Advanced': return '#F44336';
            default: return '#757575';
        }
    };

    if (loading) {
        return (
            <Container>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading exercises...</Text>
                </View>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={fetchExercises}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Back Button Header */}
                <View style={styles.backHeader}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <FontAwesome name="chevron-left" size={20} color="#000" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>All Exercises</Text>
                <View style={styles.exercisesGrid}>
                    {exercises.map((exercise) => (
                        <TouchableOpacity 
                            key={exercise.id}
                            style={styles.exerciseCard}
                            onPress={() => handleExercisePress(exercise.id)}
                            activeOpacity={0.7}
                        >
                            {exercise.imageUrl ? (
                                <Image 
                                    source={{ uri: exercise.imageUrl }} 
                                    style={styles.exerciseImage}
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <FontAwesome name="image" size={32} color="#ccc" />
                                </View>
                            )}
                            <View style={styles.exerciseInfo}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseArea}>{exercise.area}</Text>
                                <View style={styles.exerciseDetails}>
                                    <View style={styles.detailItem}>
                                        <FontAwesome name="trophy" size={12} color="#666" />
                                        <Text style={[styles.detailText, { color: getDifficultyColor(exercise.difficulty) }]}>
                                            {exercise.difficulty}
                                        </Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <FontAwesome name="cog" size={12} color="#666" />
                                        <Text style={styles.detailText}>{exercise.equipment}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </Container>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
    },
    backHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    exercisesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    exerciseCard: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    exerciseImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    placeholderImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    exerciseInfo: {
        padding: 12,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    exerciseArea: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    exerciseDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Exercises; 