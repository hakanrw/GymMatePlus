import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from '@expo/vector-icons';

interface ChatData {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
}

interface ChatItemProps {
    name: string;
    lastMessage: string;
    time: string;
}

// Temporary mock data for chat list
const mockChats: ChatData[] = [
    { id: '1', name: 'John Doe', lastMessage: 'Hey, how was your workout?', time: '10:30 AM' },
    { id: '2', name: 'Jane Smith', lastMessage: 'Great session today!', time: '9:15 AM' },
    { id: '3', name: 'Gym Buddy', lastMessage: 'See you tomorrow at 7', time: 'Yesterday' },
    { id: '4', name: 'Personal Trainer', lastMessage: 'Don\'t forget to stretch', time: 'Yesterday' },
];

const ChatItem: React.FC<ChatItemProps> = ({ name, lastMessage, time }) => {
    const navigation = useNavigation();
    
    return (
        <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatRoom', { name })}
        >
            <View style={styles.avatar}>
                <Ionicons name="person-circle-outline" size={50} color="#666" />
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{name}</Text>
                    <Text style={styles.chatTime}>{time}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const Chat = () => {
    const navigation = useNavigation() as any;

    const handleNewChat = () => {
        // For now, we'll just navigate to a new chat room with a default name
        navigation.navigate('ChatRoom', { name: 'New Chat' });
    };

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chats</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="search" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={mockChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatItem
                        name={item.name}
                        lastMessage={item.lastMessage}
                        time={item.time}
                    />
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={handleNewChat}>
                <Ionicons name="cube-outline" size={24} color="#fff" />
            </TouchableOpacity>
        </Container>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: {
        padding: 0,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        marginLeft: 20,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        marginRight: 16,
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chatTime: {
        fontSize: 12,
        color: '#666',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
