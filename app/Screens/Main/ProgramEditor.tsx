import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { doc, getDoc, updateDoc, collection, getDocs } from '@firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Dropdown from '@/components/Dropdown';

interface Exercise {
    exercise: string;
    sets: string;
    rpe: string;
}

interface FirebaseExercise {
    id: string;
    name: string;
    area: string;
}

type WorkoutProgram = {
    [key: string]: Exercise[];
};

const ProgramEditor = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { traineeId, traineeName } = route.params as {
        traineeId: string;
        traineeName: string;
    };

    const [program, setProgram] = useState<WorkoutProgram>({});
    const [loading, setLoading] = useState(true);
    const [exercises, setExercises] = useState<FirebaseExercise[]>([]);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Predefined options for sets and RPE
    const setsOptions = [
        { label: '1x5', value: '1x5' },
        { label: '2x5', value: '2x5' },
        { label: '3x5', value: '3x5' },
        { label: '4x5', value: '4x5' },
        { label: '5x5', value: '5x5' },
        { label: '1x8', value: '1x8' },
        { label: '2x8', value: '2x8' },
        { label: '3x8', value: '3x8' },
        { label: '4x8', value: '4x8' },
        { label: '1x10', value: '1x10' },
        { label: '2x10', value: '2x10' },
        { label: '3x10', value: '3x10' },
        { label: '4x10', value: '4x10' },
        { label: '1x12', value: '1x12' },
        { label: '2x12', value: '2x12' },
        { label: '3x12', value: '3x12' },
        { label: '4x12', value: '4x12' },
        { label: '3x3-5', value: '3x3-5' },
        { label: '4x4-6', value: '4x4-6' },
        { label: '3x8-10', value: '3x8-10' },
        { label: '3x10-12', value: '3x10-12' },
    ];

    const rpeOptions = [
        { label: '6', value: '6' },
        { label: '6-7', value: '6-7' },
        { label: '7', value: '7' },
        { label: '7-8', value: '7-8' },
        { label: '8', value: '8' },
        { label: '8-9', value: '8-9' },
        { label: '9', value: '9' },
        { label: '9-10', value: '9-10' },
        { label: '10', value: '10' },
    ];

    // Fetch exercises and program data when component mounts
    useEffect(() => {
        fetchExercises();
        fetchLatestProgram();
    }, [traineeId]);

    const fetchExercises = async () => {
        try {
            const exercisesRef = collection(firestore, 'exercises');
            const querySnapshot = await getDocs(exercisesRef);
            
            const exercisesList: FirebaseExercise[] = [];
            querySnapshot.forEach((doc) => {
                exercisesList.push({
                    id: doc.id,
                    name: doc.data().name,
                    area: doc.data().area,
                });
            });

            setExercises(exercisesList);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            Alert.alert('Error', 'Failed to load exercises');
        }
    };

    const fetchLatestProgram = async () => {
        try {
            const traineeDoc = await getDoc(doc(firestore, 'users', traineeId));
            if (traineeDoc.exists()) {
                setProgram(traineeDoc.data().program || {});
            }
        } catch (error) {
            console.error('Error fetching program:', error);
            Alert.alert('Error', 'Failed to load program');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExercise = (day: string) => {
        const newExercise = { exercise: '', sets: '3x10', rpe: '7' };
        setProgram(prev => ({
            ...prev,
            [day]: [...(prev[day] || []), newExercise]
        }));
    };

    const handleUpdateExercise = (day: string, index: number, field: keyof Exercise, value: string) => {
        setProgram(prev => ({
            ...prev,
            [day]: prev[day].map((ex, i) => 
                i === index ? { ...ex, [field]: value } : ex
            )
        }));
    };

    const handleDeleteExercise = (day: string, index: number) => {
        setProgram(prev => ({
            ...prev,
            [day]: prev[day].filter((_, i) => i !== index)
        }));
    };

    const handleSaveProgram = async () => {
        try {
            await updateDoc(doc(firestore, 'users', traineeId), {
                program: program
            });
            Alert.alert('Success', 'Program updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error saving program:', error);
            Alert.alert('Error', 'Failed to save program');
        }
    };

    // Convert exercises to dropdown options
    const exerciseOptions = exercises.map(exercise => ({
        label: `${exercise.name} (${exercise.area})`,
        value: exercise.name
    }));

    if (loading) {
        return (
            <Container>
                <Text>Loading program...</Text>
            </Container>
        );
    }

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>{traineeName}'s Program</Text>
                <TouchableOpacity onPress={handleSaveProgram} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {days.map(day => (
                    <View key={day} style={styles.daySection}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayTitle}>{day}</Text>
                            <TouchableOpacity 
                                onPress={() => handleAddExercise(day)}
                                style={styles.addButton}
                            >
                                <Ionicons name="add-circle-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {program[day]?.map((exercise, index) => (
                            <View key={index} style={styles.exerciseRow}>
                                <Dropdown
                                    options={exerciseOptions}
                                    selectedValue={exercise.exercise}
                                    onSelect={(value: string) => 
                                        handleUpdateExercise(day, index, 'exercise', value)
                                    }
                                    placeholder="Select exercise"
                                    searchable={true}
                                    style={styles.exerciseDropdown}
                                />
                                <View style={styles.exerciseDetails}>
                                    <Dropdown
                                        options={setsOptions}
                                        selectedValue={exercise.sets}
                                        onSelect={(value: string) => 
                                            handleUpdateExercise(day, index, 'sets', value)
                                        }
                                        placeholder="Sets"
                                        style={styles.setsDropdown}
                                    />
                                    <Dropdown
                                        options={rpeOptions}
                                        selectedValue={exercise.rpe}
                                        onSelect={(value: string) => 
                                            handleUpdateExercise(day, index, 'rpe', value)
                                        }
                                        placeholder="RPE"
                                        style={styles.rpeDropdown}
                                    />
                                    <TouchableOpacity 
                                        onPress={() => handleDeleteExercise(day, index)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </Container>
    );
};

export default ProgramEditor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    saveButton: {
        padding: 8,
        backgroundColor: '#000',
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    daySection: {
        marginBottom: 24,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    addButton: {
        padding: 4,
    },
    exerciseRow: {
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    exerciseDropdown: {
        marginBottom: 8,
    },
    exerciseDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    setsDropdown: {
        flex: 1,
    },
    rpeDropdown: {
        flex: 1,
    },
    deleteButton: {
        padding: 8,
    },
}); 