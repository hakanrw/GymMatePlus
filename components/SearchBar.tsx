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

interface SearchProps {
    onSearch: (searchText: string) => void;
}

export const Search: React.FC<SearchProps> = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');

    const handleTextChange = (text: string) => {
        setSearchText(text);
        onSearch(text);
    };

    return (
        <View style={styles.container}>
            <FontAwesome name="search" size={25} color={'#aaa'}/>
            <TextInput 
                style={styles.input} 
                placeholder='Search users...'
                value={searchText}
                onChangeText={handleTextChange}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#efefef',
        width: '100%',
        padding: 12,
        borderRadius: 10,
        flexDirection: 'row'
    },
    input: {
        color: '#aaa',
        fontSize: 18,
        marginLeft: 20,
        flex: 1,
        marginBottom: -10,
        marginTop: -10,
        borderBottomWidth: 0,
        padding: 0
    }
});
