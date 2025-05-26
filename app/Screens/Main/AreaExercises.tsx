import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { collection, query, where, getDocs } from '@firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import { HomeStackParamList } from '@/app/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Exercise {
    id: string;
    name: string;
    area: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    equipment: string;
    imageUrl?: string;
    targetMuscles: string[];
}

type AreaExercisesNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'AreaExercises'>;

const AreaExercises = () => {
    const navigation = useNavigation<AreaExercisesNavigationProp>();
    const route = useRoute();
    const { area } = route.params as { area: string };
    
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAreaExercises();
    }, [area]);

    const fetchAreaExercises = async () => {
        try {
            const exercisesRef = collection(firestore, 'exercises');
            const q = query(exercisesRef, where('area', '==', area));
            const querySnapshot = await getDocs(q);
            
            const exercisesList: Exercise[] = [];
            querySnapshot.forEach((doc) => {
                exercisesList.push({
                    id: doc.id,
                    ...doc.data()
                } as Exercise);
            });

            setExercises(exercisesList);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            Alert.alert('Error', 'Failed to load exercises');
        } finally {
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
            <Container style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading {area} exercises...</Text>
            </Container>
        );
    }

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false}>
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

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.areaTitle}>{area} Exercises</Text>
                    <Text style={styles.exerciseCount}>
                        {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} found
                    </Text>
                </View>

                {/* Exercises List */}
                {exercises.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <FontAwesome name="search" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No exercises found for {area}</Text>
                        <Text style={styles.emptySubtext}>Check back later for more exercises!</Text>
                    </View>
                ) : (
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
                )}

                {/* Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
};

export default AreaExercises;

const styles = StyleSheet.create({
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
    backHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    header: {
        marginBottom: 24,
    },
    areaTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    exerciseCount: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    exercisesList: {
        gap: 16,
    },
    exerciseCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    imageContainer: {
        marginRight: 16,
    },
    exerciseImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
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
}); 