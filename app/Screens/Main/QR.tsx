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

const QR = () => {
    const navigation = useNavigation() as any;

    const handleContinue = () => {
        navigation.navigate('GymSelection');
    };

    return (
        <Container style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', opacity: 0.5}}>
            <View style={styles.scan}>

            </View>
        </Container>
    );
};

export default QR;

const styles = StyleSheet.create({
    scan: {
        width: 300,
        height: 300,
        borderRadius: 10,
        borderColor: '#ddd',
        backgroundColor: '#ddd'
    }
});
