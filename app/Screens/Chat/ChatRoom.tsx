import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/types/navigation';
import { GifPicker } from '../../../components/GifPicker';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'other';
    timestamp: string;
    type: 'text' | 'gif';
    gifUrl?: string;
}

// Update initialMessages to include type
const initialMessages: Message[] = [
    { id: '1', text: 'Hey, are you coming to the gym today?', sender: 'other', timestamp: '10:00 AM', type: 'text' },
    { id: '2', text: 'Yes, I\'ll be there in an hour', sender: 'user', timestamp: '10:01 AM', type: 'text' },
    { id: '3', text: 'Great! Let\'s do a workout together', sender: 'other', timestamp: '10:01 AM', type: 'text' },
    { id: '4', text: 'Sure, what are you planning to train?', sender: 'user', timestamp: '10:02 AM', type: 'text' },
    { id: '5', text: 'Thinking about chest and triceps', sender: 'other', timestamp: '10:02 AM', type: 'text' },
];

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <View style={[
        styles.messageBubble,
        message.sender === 'user' ? styles.userMessage : styles.otherMessage
    ]}>
        {message.type === 'text' ? (
            <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.otherMessageText
            ]}>
                {message.text}
            </Text>
        ) : (
            <Image
                source={{ uri: message.gifUrl }}
                style={styles.gifMessage}
                resizeMode="contain"
            />
        )}
        <Text style={styles.timestamp}>{message.timestamp}</Text>
    </View>
);

const ChatRoom: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<Props['route']>();
    const { name } = route.params;
    
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isGifPickerVisible, setIsGifPickerVisible] = useState(false);
    const flatListRef = React.useRef<FlatList>(null);

    const sendMessage = (text: string, type: 'text' | 'gif' = 'text', gifUrl?: string) => {
        const newMessage: Message = {
            id: (messages.length + 1).toString(),
            text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type,
            ...(gifUrl && { gifUrl }),
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    const handleSendGif = (gifUrl: string) => {
        sendMessage('', 'gif', gifUrl);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{name}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="videocam" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="call" size={22} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                style={styles.chatContainer}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageBubble message={item} />}
                inverted={false}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                    if (messages.length > 0) {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }
                }}
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.inputContainer}
            >
                <View style={styles.inputWrapper}>
                    <TouchableOpacity 
                        style={styles.attachButton}
                        onPress={() => setIsGifPickerVisible(true)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        multiline
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => sendMessage(inputText)}
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={() => sendMessage(inputText)}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons 
                            name="send" 
                            size={24} 
                            color={inputText.trim() ? "#007AFF" : "#A8A8A8"} 
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <GifPicker
                isVisible={isGifPickerVisible}
                onClose={() => setIsGifPickerVisible(false)}
                onSelectGif={handleSendGif}
            />
        </SafeAreaView>
    );
};

export default ChatRoom;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 10,
    },
    headerName: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 5,
        marginLeft: 15,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    messagesList: {
        padding: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginVertical: 4,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8E8E8',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    userMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#000',
    },
    timestamp: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        padding: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attachButton: {
        padding: 5,
    },
    input: {
        flex: 1,
        marginHorizontal: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        maxHeight: 100,
    },
    sendButton: {
        padding: 5,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    gifMessage: {
        width: 200,
        height: 150,
        borderRadius: 8,
    },
}); 