import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Dumbell } from './Dumbell';

const { width } = Dimensions.get('window');

export const LoadingScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const dotAnim1 = useRef(new Animated.Value(0)).current;
    const dotAnim2 = useRef(new Animated.Value(0)).current;
    const dotAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Initial fade in and scale animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous rotation animation for the dumbbell
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();

        // Staggered dot animations
        const dotAnimations = [dotAnim1, dotAnim2, dotAnim3];
        const animateDots = () => {
            dotAnimations.forEach((anim, index) => {
                setTimeout(() => {
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }, index * 200);
            });
        };

        // Start dot animation and repeat
        animateDots();
        const interval = setInterval(animateDots, 1200);

        return () => clearInterval(interval);
    }, [fadeAnim, scaleAnim, rotateAnim, dotAnim1, dotAnim2, dotAnim3]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.dumbbellContainer,
                        {
                            transform: [{ rotate: rotateInterpolate }],
                        },
                    ]}
                >
                    <Dumbell style={styles.dumbbell} />
                </Animated.View>

                <Text style={styles.title}>BodyTrack™</Text>
                <Text style={styles.subtitle}>Loading your fitness data</Text>

                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                transform: [{ scale: dotAnim1 }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                transform: [{ scale: dotAnim2 }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                transform: [{ scale: dotAnim3 }],
                            },
                        ]}
                    />
                </View>
            </Animated.View>

            <View style={styles.backgroundPattern}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.backgroundDot,
                            {
                                left: Math.random() * width,
                                top: Math.random() * 600,
                                opacity: 0.1,
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        position: 'relative',
    },
    content: {
        alignItems: 'center',
        zIndex: 2,
    },
    dumbbellContainer: {
        marginBottom: 30,
    },
    dumbbell: {
        transform: [{ scale: 1.5 }],
        opacity: 0.8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    backgroundDot: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#007AFF',
    },
}); 