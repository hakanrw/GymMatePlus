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
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

interface Exercise {
    exercise: string;
    sets: string;
    rpe: string;
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
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Fetch the latest program data when component mounts
    useEffect(() => {
        fetchLatestProgram();
    }, [traineeId]);

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
        const newExercise = { exercise: 'New Exercise', sets: '3x10', rpe: '7' };
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
                                <TextInput
                                    style={styles.exerciseInput}
                                    value={exercise.exercise}
                                    onChangeText={(value) => 
                                        handleUpdateExercise(day, index, 'exercise', value)
                                    }
                                    placeholder="Exercise name"
                                />
                                <View style={styles.exerciseDetails}>
                                    <TextInput
                                        style={styles.setsInput}
                                        value={exercise.sets}
                                        onChangeText={(value) => 
                                            handleUpdateExercise(day, index, 'sets', value)
                                        }
                                        placeholder="Sets"
                                    />
                                    <TextInput
                                        style={styles.rpeInput}
                                        value={exercise.rpe}
                                        onChangeText={(value) => 
                                            handleUpdateExercise(day, index, 'rpe', value)
                                        }
                                        placeholder="RPE"
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
    exerciseInput: {
        fontSize: 16,
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 4,
    },
    exerciseDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    setsInput: {
        flex: 1,
        padding: 8,
        marginRight: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 4,
    },
    rpeInput: {
        flex: 1,
        padding: 8,
        marginRight: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 4,
    },
    deleteButton: {
        padding: 8,
    },
}); 