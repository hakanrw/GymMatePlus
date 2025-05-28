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
                <Text style={styles.exerciseCount}>
                    {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} available
                </Text>
                
                <View style={styles.exercisesList}>
                    {exercises.map((exercise) => (
                        <TouchableOpacity 
                            key={exercise.id}
                            style={styles.exerciseCard}
                            onPress={() => handleExercisePress(exercise.id)}
                            activeOpacity={0.7}
                        >
                            {/* Exercise Image */}
                            <View style={styles.imageContainer}>
                                {exercise.imageUrl ? (
                                    <Image 
                                        source={{ uri: exercise.imageUrl }} 
                                        style={styles.exerciseImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <FontAwesome name="image" size={32} color="#ccc" />
                                    </View>
                                )}
                            </View>

                            {/* Exercise Info */}
                            <View style={styles.exerciseInfo}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseArea}>{exercise.area}</Text>
                                <Text style={styles.exerciseDescription} numberOfLines={2}>
                                    {exercise.description}
                                </Text>
                                
                                {/* Exercise Details */}
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

                                {/* Target Muscles */}
                                <View style={styles.musclesContainer}>
                                    {exercise.targetMuscles.slice(0, 3).map((muscle, index) => (
                                        <View key={index} style={styles.muscleTag}>
                                            <Text style={styles.muscleText}>{muscle}</Text>
                                        </View>
                                    ))}
                                    {exercise.targetMuscles.length > 3 && (
                                        <Text style={styles.moreText}>+{exercise.targetMuscles.length - 3} more</Text>
                                    )}
                                </View>
                            </View>

                            {/* Arrow Icon */}
                            <View style={styles.arrowContainer}>
                                <FontAwesome name="chevron-right" size={16} color="#ccc" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                
                {/* Padding */}
                <View style={{ height: 40 }} />
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
    exerciseCount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    exercisesList: {
        flexDirection: 'column',
        gap: 16,
    },
    exerciseCard: {
        width: '100%',
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
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 16,
    },
    exerciseImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseInfo: {
        flex: 1,
        paddingRight: 8,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000',
    },
    exerciseArea: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    exerciseDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        fontWeight: '500',
    },
    musclesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'center',
    },
    muscleTag: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    muscleText: {
        fontSize: 10,
        color: '#1976d2',
        fontWeight: '500',
    },
    moreText: {
        fontSize: 10,
        color: '#999',
        fontStyle: 'italic',
    },
    arrowContainer: {
        marginLeft: 8,
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