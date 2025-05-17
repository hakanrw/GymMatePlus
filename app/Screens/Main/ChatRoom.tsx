import React, { useState, useEffect } from 'react';
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
import { auth } from '../../firebaseConfig';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    serverTimestamp, 
    getFirestore,
    doc,
    updateDoc,
    getDoc
} from '@firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: Date;
    type: 'text' | 'gif';
    gifUrl?: string;
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isCurrentUser = message.senderId === auth.currentUser?.uid;
    
    return (
        <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.userMessage : styles.otherMessage
        ]}>
            {message.type === 'text' ? (
                <Text style={[
                    styles.messageText,
                    isCurrentUser ? styles.userMessageText : styles.otherMessageText
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
            <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
            </Text>
        </View>
    );
};

const ChatRoom: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<Props['route']>();
    const { chatId, name, photoURL, userId } = route.params;
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isGifPickerVisible, setIsGifPickerVisible] = useState(false);
    const flatListRef = React.useRef<FlatList>(null);

    useEffect(() => {
        const initializeChat = async () => {
            if (!chatId && userId && auth.currentUser) {
                // Create new chat
                const db = getFirestore();
                const newChatRef = await addDoc(collection(db, 'conversations'), {
                    participants: [auth.currentUser.uid, userId],
                    lastMessage: {
                        text: '',
                        timestamp: serverTimestamp(),
                        senderId: auth.currentUser.uid
                    },
                    participantInfo: {
                        [auth.currentUser.uid]: {
                            name: auth.currentUser.displayName || 'You',
                            photoURL: auth.currentUser.photoURL
                        },
                        [userId]: {
                            name: name,
                            photoURL: photoURL
                        }
                    }
                });

                // Update route params with new chatId
                navigation.setParams({ chatId: newChatRef.id });
            }
        };

        initializeChat();
    }, [chatId, userId]);

    useEffect(() => {
        if (!chatId) return;

        const db = getFirestore();
        const q = query(
            collection(db, `conversations/${chatId}/messages`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageData: Message[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                messageData.push({
                    id: doc.id,
                    text: data.text,
                    senderId: data.senderId,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    type: data.type || 'text',
                    gifUrl: data.gifUrl,
                });
            });
            setMessages(messageData);
        });

        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = async (text: string, type: 'text' | 'gif' = 'text', gifUrl?: string) => {
        if (!chatId || !auth.currentUser) return;

        const db = getFirestore();
        const messageData = {
            text,
            senderId: auth.currentUser.uid,
            timestamp: serverTimestamp(),
            type,
            ...(gifUrl && { gifUrl }),
        };

        try {
            // Add message to subcollection
            await addDoc(collection(db, `conversations/${chatId}/messages`), messageData);

            // Update last message in conversation
            await updateDoc(doc(db, 'conversations', chatId), {
                lastMessage: {
                    text,
                    timestamp: serverTimestamp(),
                    senderId: auth.currentUser.uid,
                },
            });

            setInputText('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
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
                    {photoURL ? (
                        <Image source={{ uri: photoURL }} style={styles.headerAvatar} />
                    ) : (
                        <Ionicons name="person-circle-outline" size={40} color="#666" />
                    )}
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
        flexDirection: 'row',
        alignItems: 'center',
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
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
}); 