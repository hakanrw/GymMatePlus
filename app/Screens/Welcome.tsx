import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MainButton } from '@/components/MainButton';

const Welcome = () => {
    const navigation = useNavigation() as any;

    const handleContinue = () => {
        navigation.navigate('GymSelection');
    };

    return (
        <View style={styles.root}>
            <StatusBar style="dark" translucent backgroundColor="transparent" />
            {Platform.OS === 'android' && (
                <View style={{ height: RNStatusBar.currentHeight }} />
            )}
            <SafeAreaView style={styles.container}>
                <View>
                    <Text style={styles.title}>Welcome to GymMate+!</Text>
                    <Text style={styles.title1}>Welcome to GymMate+!</Text>
                    <Text style={styles.title2}>Welcome to GymMate+!</Text>
                </View>

                <Text style={styles.description}>
                    Your personal fitness journey starts now.{"\n"}
                    Ready to crush your goals today?
                </Text>
                <MainButton
                    onPress={handleContinue}
                    text="Continue to Gym Selection"/>
            </SafeAreaView>
        </View>
    );
};

export default Welcome;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
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
