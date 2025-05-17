import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type MainButtonProp = {
    onPress: () => void,
    text: string,
    style?: ViewStyle
};

export const MainButton = (data: MainButtonProp) => {
    return (
        <TouchableOpacity
            style={[styles.button, data.style]}
            onPress={data.onPress}>
                <Text style={styles.text}>{data.text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000',
        marginTop: 10,
        width: '100%',
        alignSelf: 'center',
        marginBottom: 30,
        borderRadius: 10,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
