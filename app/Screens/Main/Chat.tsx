import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
    FlatList,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, getFirestore, addDoc, doc, getDoc, getDocs, DocumentData } from '@firebase/firestore';

interface ChatData {
    id: string;
    participants: string[];
    lastMessage: {
        text: string;
        timestamp: Date;
        senderId: string;
    };
    participantInfo: {
        [key: string]: {
            name: string;
            photoURL: string;
        };
    };
}

interface ChatItemProps {
    chat: ChatData;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat }) => {
    const navigation = useNavigation();
    const currentUserId = auth.currentUser?.uid;
    const otherParticipant = Object.entries(chat.participantInfo).find(([id]) => id !== currentUserId)?.[1];
    
    return (
        <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatRoom', { 
                chatId: chat.id,
                name: otherParticipant?.name || 'Unknown User',
                photoURL: otherParticipant?.photoURL
            })}
        >
            <View style={styles.avatar}>
                {otherParticipant?.photoURL ? (
                    <Image 
                        source={{ uri: otherParticipant.photoURL }} 
                        style={styles.avatarImage}
                    />
                ) : (
                    <Ionicons name="person-circle-outline" size={50} color="#666" />
                )}
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{otherParticipant?.name || 'Unknown User'}</Text>
                    <Text style={styles.chatTime}>
                        {chat.lastMessage.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage.text}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const Chat = () => {
    const navigation = useNavigation() as any;
    const [chats, setChats] = useState<ChatData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) {
            setError('You must be logged in to view chats');
            setLoading(false);
            return;
        }

        console.log('Setting up chat listener for user:', currentUserId);
        const db = getFirestore();
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentUserId),
            orderBy('lastMessage.timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                console.log('Received chat snapshot with', snapshot.size, 'documents');
                const chatData: ChatData[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    chatData.push({ 
                        id: doc.id, 
                        ...data,
                        lastMessage: {
                            ...data.lastMessage,
                            timestamp: data.lastMessage.timestamp?.toDate() || new Date()
                        }
                    } as ChatData);
                });
                setChats(chatData);
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error('Error fetching chats:', error);
                setError('Failed to load chats');
                setLoading(false);
            }
        );

        return () => {
            console.log('Cleaning up chat listener');
            unsubscribe();
        };
    }, []);

    const createNewChat = async (userId: string) => {
        if (!auth.currentUser) return;

        const db = getFirestore();
        
        // Check if chat already exists
        const existingChatsQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', auth.currentUser.uid)
        );
        
        const existingChats = await getDocs(existingChatsQuery);
        const existingChat = existingChats.docs.find((doc: DocumentData) => {
            const data = doc.data();
            return data.participants.includes(userId);
        });

        if (existingChat) {
            // Navigate to existing chat
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();
            navigation.navigate('ChatRoom', {
                chatId: existingChat.id,
                name: userData?.displayName || 'Unknown User',
                photoURL: userData?.photoURL
            });
            return;
        }

        // Get user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        // Create new chat
        const newChatRef = await addDoc(collection(db, 'conversations'), {
            participants: [auth.currentUser.uid, userId],
            lastMessage: {
                text: '',
                timestamp: new Date(),
                senderId: auth.currentUser.uid
            },
            participantInfo: {
                [auth.currentUser.uid]: {
                    name: auth.currentUser.displayName || 'You',
                    photoURL: auth.currentUser.photoURL
                },
                [userId]: {
                    name: userData?.displayName || 'Unknown User',
                    photoURL: userData?.photoURL
                }
            }
        });

        // Navigate to new chat
        navigation.navigate('ChatRoom', {
            chatId: newChatRef.id,
            name: userData?.displayName || 'Unknown User',
            photoURL: userData?.photoURL
        });
    };

    const handleNewChat = () => {
        setShowMenu(false); // Close menu if open
        navigation.navigate('UserSelection');
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    if (error) {
        return (
            <Container style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Chats</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Chats</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text>Loading chats...</Text>
                </View>
            </Container>
        );
    }

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chats</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="search" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={toggleMenu}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {showMenu && (
                <View style={styles.menu}>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={handleNewChat}
                    >
                        <Ionicons name="person-add-outline" size={20} color="#000" />
                        <Text style={styles.menuItemText}>Start a New Chat</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatItem chat={item} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <TouchableOpacity 
                            style={styles.startChatButton}
                            onPress={handleNewChat}
                        >
                            <Text style={styles.startChatButtonText}>Start a New Chat</Text>
                        </TouchableOpacity>
                    </View>
                }
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
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    startChatButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    startChatButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    menu: {
        position: 'absolute',
        top: 60,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderWidth: 1,
        borderColor: '#eee',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 4,
    },
    menuItemText: {
        marginLeft: 12,
        fontSize: 16,
    },
});
