import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './StarRating';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WorkoutRatingModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmitRating: (difficultyRating: number, musclePainRating: number) => Promise<void>;
    duration: number; // workout duration in minutes
}

const WorkoutRatingModal: React.FC<WorkoutRatingModalProps> = ({
    visible,
    onClose,
    onSubmitRating,
    duration,
}) => {
    const [difficultyRating, setDifficultyRating] = useState(0);
    const [musclePainRating, setMusclePainRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (difficultyRating === 0 || musclePainRating === 0) {
            return; // Don't submit if ratings aren't selected
        }

        setIsSubmitting(true);
        try {
            await onSubmitRating(difficultyRating, musclePainRating);
            setDifficultyRating(0);
            setMusclePainRating(0);
            onClose();
        } catch (error) {
            console.error('Error submitting rating:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setDifficultyRating(0);
        setMusclePainRating(0);
        onClose();
    };

    const canSubmit = difficultyRating > 0 && musclePainRating > 0 && !isSubmitting;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Ionicons name="fitness" size={32} color="#4CAF50" />
                        <Text style={styles.title}>Workout Complete! 💪</Text>
                        <Text style={styles.subtitle}>
                            Great job! You worked out for {duration} minutes
                        </Text>
                    </View>

                    <View style={styles.ratingsContainer}>
                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingLabel}>How difficult was your workout?</Text>
                            <Text style={styles.ratingDescription}>
                                1 = Very Easy • 5 = Very Hard
                            </Text>
                            <StarRating
                                rating={difficultyRating}
                                onRatingChange={setDifficultyRating}
                                size={36}
                                color="#FF9800"
                            />
                        </View>

                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingLabel}>How much muscle fatigue do you feel?</Text>
                            <Text style={styles.ratingDescription}>
                                1 = No Fatigue • 5 = Very Fatigued
                            </Text>
                            <StarRating
                                rating={musclePainRating}
                                onRatingChange={setMusclePainRating}
                                size={36}
                                color="#E91E63"
                            />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !canSubmit && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={!canSubmit}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Rating</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {!canSubmit && !isSubmitting && (
                        <Text style={styles.helpText}>
                            Please rate both difficulty and muscle fatigue to continue
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 400,
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    ratingsContainer: {
        width: '100%',
        marginBottom: 32,
    },
    ratingSection: {
        marginBottom: 32,
        alignItems: 'center',
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    ratingDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12,
    },
    skipButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        flex: 2,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    helpText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 12,
    },
});

export default WorkoutRatingModal; 