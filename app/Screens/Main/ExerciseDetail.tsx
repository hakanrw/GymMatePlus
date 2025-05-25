import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { doc, getDoc } from '@firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import { HomeStackParamList } from '@/app/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
    videoUrl?: string;
}

type ExerciseDetailNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ExerciseDetail'>;

const ExerciseDetail = () => {
    const navigation = useNavigation<ExerciseDetailNavigationProp>();
    const route = useRoute();
    const { exerciseId } = route.params as { exerciseId: string };
    
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExerciseDetail();
    }, [exerciseId]);

    const fetchExerciseDetail = async () => {
        try {
            const exerciseDoc = await getDoc(doc(firestore, 'exercises', exerciseId));
            if (exerciseDoc.exists()) {
                setExercise({
                    id: exerciseDoc.id,
                    ...exerciseDoc.data()
                } as Exercise);
            } else {
                Alert.alert('Error', 'Exercise not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error fetching exercise:', error);
            Alert.alert('Error', 'Failed to load exercise details');
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.loadingText}>Loading exercise details...</Text>
            </Container>
        );
    }

    if (!exercise) {
        return (
            <Container style={styles.errorContainer}>
                <Text style={styles.errorText}>Exercise not found</Text>
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
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.areaTag}>
                        <Text style={styles.areaText}>{exercise.area}</Text>
                    </View>
                </View>

                {/* Exercise Image */}
                {exercise.imageUrl && (
                    <View style={styles.imageContainer}>
                        <Image 
                            source={{ uri: exercise.imageUrl }} 
                            style={styles.exerciseImage}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {/* Exercise Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <FontAwesome name="trophy" size={20} color="#666" />
                            <Text style={styles.infoLabel}>Difficulty</Text>
                            <Text style={[styles.infoValue, { color: getDifficultyColor(exercise.difficulty) }]}>
                                {exercise.difficulty}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <FontAwesome name="cog" size={20} color="#666" />
                            <Text style={styles.infoLabel}>Equipment</Text>
                            <Text style={styles.infoValue}>{exercise.equipment}</Text>
                        </View>
                    </View>
                </View>

                {/* Target Muscles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Target Muscles</Text>
                    <View style={styles.muscleContainer}>
                        {exercise.targetMuscles.map((muscle, index) => (
                            <View key={index} style={styles.muscleTag}>
                                <Text style={styles.muscleText}>{muscle}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{exercise.description}</Text>
                </View>

                {/* Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    {exercise.instructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.instructionText}>{instruction}</Text>
                        </View>
                    ))}
                </View>

                {/* Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </Container>
    );
};

export default ExerciseDetail;

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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
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
        marginBottom: 20,
    },
    exerciseName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    areaTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    areaText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    imageContainer: {
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    exerciseImage: {
        width: '100%',
        height: 200,
    },
    infoSection: {
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    infoItem: {
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    muscleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    muscleTag: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    muscleText: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: '500',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    instructionText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
}); 