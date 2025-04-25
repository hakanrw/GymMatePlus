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

const Chat = () => {
    const navigation = useNavigation() as any;

    return (
        <Container style={{padding: 0}}>
            Chat
        </Container>
    );
};

export default Chat;

const styles = StyleSheet.create({

});
