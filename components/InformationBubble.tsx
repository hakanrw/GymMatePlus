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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type InformationBubbleProp = {
    status: string,
    message: string
};

export const InformationBubble = (data: InformationBubbleProp) => {
    let style = styles.info;
    if (data.status == "error") style = styles.error;
    if (data.status == "success") style = styles.success;

    return (
        <View style={[styles.bubble, style]}>
                <Text style={[styles.text, style]}>{data.message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    info: {
        backgroundColor: '#91d3ff',
        borderColor: '#3db1ff',
        color: '#004d80',
    },

    error: {
        backgroundColor: '#ff6395',
        borderColor: '#ff0857',
        color: '#990c39',
    },

    success: {
        backgroundColor: '#66ff78',
        borderColor: '#00e01a',
        color: '#059615',
    },

    bubble: {
        borderWidth: 3,
        marginTop: 10,
        width: '100%',
        alignSelf: 'center',
        marginBottom: 10,
        borderRadius: 10,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
