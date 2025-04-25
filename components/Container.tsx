import React, { Children, ReactNode, useState } from 'react';
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
    StyleProp,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type ContainerProp = {
    children?: ReactNode,
    style?: StyleProp<ViewStyle>
};

export const Container = (data: ContainerProp) => {
    if (Platform.OS === 'ios')
        return (
            <SafeAreaView style={[styles.container, data.style]}>
                {data.children}
            </SafeAreaView>
        )
    
    return (
        <View style={[styles.container, data.style]}>
            {data.children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
    }
});
