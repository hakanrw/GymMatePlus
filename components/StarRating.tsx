import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: number;
    color?: string;
    disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    size = 32,
    color = '#FFD700',
    disabled = false,
}) => {
    const handleStarPress = (selectedRating: number) => {
        if (!disabled) {
            onRatingChange(selectedRating);
        }
    };

    return (
        <View style={styles.container}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    style={styles.star}
                    disabled={disabled}
                >
                    <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={size}
                        color={star <= rating ? color : '#ccc'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        paddingHorizontal: 2,
    },
});

export default StarRating; 