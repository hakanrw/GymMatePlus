import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MainButton } from '@/components/MainButton';
import { Container } from '@/components/Container';
import { Dumbell } from '@/components/Dumbell';

const Welcome = () => {
    const navigation = useNavigation() as any;
    
    // Animation refs
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const slideAnim1 = useRef(new Animated.Value(50)).current;
    const slideAnim2 = useRef(new Animated.Value(50)).current;
    const slideAnim3 = useRef(new Animated.Value(50)).current;
    const dumbbellScale = useRef(new Animated.Value(0)).current;
    const dumbbellRotate = useRef(new Animated.Value(0)).current;
    const descriptionFade = useRef(new Animated.Value(0)).current;
    const buttonFade = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Sequential animations
        const animateSequence = () => {
            // First title animation
            Animated.parallel([
                Animated.timing(fadeAnim1, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim1, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Second title animation (delayed)
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(fadeAnim2, {
                            toValue: 1,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                        Animated.timing(slideAnim2, {
                            toValue: 0,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        // Third title animation (delayed)
                        setTimeout(() => {
                            Animated.parallel([
                                Animated.timing(fadeAnim3, {
                                    toValue: 1,
                                    duration: 400,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(slideAnim3, {
                                    toValue: 0,
                                    duration: 400,
                                    useNativeDriver: true,
                                }),
                            ]).start(() => {
                                // Dumbbell animation
                                setTimeout(() => {
                                    Animated.parallel([
                                        Animated.spring(dumbbellScale, {
                                            toValue: 1,
                                            tension: 100,
                                            friction: 8,
                                            useNativeDriver: true,
                                        }),
                                        Animated.timing(dumbbellRotate, {
                                            toValue: 1,
                                            duration: 1000,
                                            useNativeDriver: true,
                                        }),
                                    ]).start(() => {
                                        // Description animation
                                        setTimeout(() => {
                                            Animated.timing(descriptionFade, {
                                                toValue: 1,
                                                duration: 800,
                                                useNativeDriver: true,
                                            }).start(() => {
                                                // Button animation
                                                setTimeout(() => {
                                                    Animated.parallel([
                                                        Animated.timing(buttonFade, {
                                                            toValue: 1,
                                                            duration: 600,
                                                            useNativeDriver: true,
                                                        }),
                                                        Animated.spring(buttonScale, {
                                                            toValue: 1,
                                                            tension: 100,
                                                            friction: 8,
                                                            useNativeDriver: true,
                                                        }),
                                                    ]).start();
                                                }, 300);
                                            });
                                        }, 200);
                                    });
                                }, 300);
                            });
                        }, 200);
                    });
                }, 300);
            });
        };

        animateSequence();

        // Continuous dumbbell rotation
        const rotateLoop = Animated.loop(
            Animated.timing(dumbbellRotate, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: true,
            })
        );
        
        setTimeout(() => {
            rotateLoop.start();
        }, 2000);

        return () => {
            rotateLoop.stop();
        };
    }, []);

    const handleContinue = () => {
        navigation.navigate('GymSelection');
    };

    const rotateInterpolate = dumbbellRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Container style={{justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={styles.titleContainer}>
                <Animated.Text 
                    style={[
                        styles.title,
                        {
                            opacity: fadeAnim1,
                            transform: [{ translateY: slideAnim1 }],
                        }
                    ]}
                >
                    Welcome to GymMate+!
                </Animated.Text>
                <Animated.Text 
                    style={[
                        styles.title1,
                        {
                            opacity: fadeAnim2,
                            transform: [{ translateY: slideAnim2 }],
                        }
                    ]}
                >
                    Welcome to GymMate+!
                </Animated.Text>
                <Animated.Text 
                    style={[
                        styles.title2,
                        {
                            opacity: fadeAnim3,
                            transform: [{ translateY: slideAnim3 }],
                        }
                    ]}
                >
                    Welcome to GymMate+!
                </Animated.Text>
            </View>
            
            <Animated.View
                style={{
                    transform: [
                        { scale: dumbbellScale },
                        { rotate: rotateInterpolate }
                    ],
                }}
            >
                <Dumbell style={{transform: [{scale: 1.2}], opacity: 0.5}}/>
            </Animated.View>
            
            <Animated.Text 
                style={[
                    styles.description,
                    {
                        opacity: descriptionFade,
                    }
                ]}
            >
                Your personal fitness journey starts now.{"\n"}
                Ready to crush your goals today?
            </Animated.Text>
            
            {/* Padding */}
            <View />
            <View />
            <View />
            
            <Animated.View
                style={{
                    opacity: buttonFade,
                    transform: [{ scale: buttonScale }],
                }}
            >
                <MainButton
                    onPress={handleContinue}
                    text="Continue to Gym Selection"
                />
            </Animated.View>
        </Container>
    );
};

export default Welcome;

const styles = StyleSheet.create({
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        height: 42,
        color: '#000',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },
    title1: {
        fontSize: 28,
        height: 39,
        color: '#545454',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },
    title2: {
        fontSize: 26,
        height: 36,
        color: '#adadad',
        fontWeight: '700',
        textAlign: 'center',

    },
    submitButton: {
        backgroundColor: '#000',

        width: 300,
        alignSelf: 'center',
        borderRadius: 10,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontWeight: '500',
        fontSize: 24,
        color: '#555',
        textAlign: 'center',
        marginVertical: 30,
        lineHeight: 26,
        paddingHorizontal: 20,
    },
});
