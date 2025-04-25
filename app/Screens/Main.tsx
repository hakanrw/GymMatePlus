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
import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import { MainButton } from '@/components/MainButton';
import { Container } from '@/components/Container';
import { Dumbell } from '@/components/Dumbell';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Main = () => {
    const navigation = useNavigation() as any;

    const handleContinue = () => {
        navigation.navigate('GymSelection');
    };

    return (
        <Container style={{padding: 0}}>
        </Container>
    );
};

export default Main;

const styles = StyleSheet.create({

});
