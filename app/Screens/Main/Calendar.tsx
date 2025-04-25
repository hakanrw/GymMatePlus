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
import { Container } from '@/components/Container';
import { Dumbell } from '@/components/Dumbell';

const Calendar = () => {
    const navigation = useNavigation() as any;

    const handleContinue = () => {
        navigation.navigate('GymSelection');
    };

    return (
        <Container style={{padding: 0}}>
            Calendar
        </Container>
    );
};

export default Calendar;

const styles = StyleSheet.create({

});
