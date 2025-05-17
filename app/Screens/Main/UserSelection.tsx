import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { auth } from '../../firebaseConfig';
import { collection, query, getFirestore, getDocs, where } from '@firebase/firestore';

interface User {
    id: string;
    displayName: string;
    photoURL: string;
    email: string;
}

const UserSelection = () => {
    const navigation = useNavigation();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Current user:', auth.currentUser?.uid);
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => 
                user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            console.log('Fetching users...');
            const db = getFirestore();
            
            // First get all users who have completed onboarding
            const usersQuery = query(
                collection(db, 'users'),
                where('onBoardingComplete', '==', true)
            );
            const snapshot = await getDocs(usersQuery);
            console.log('Number of users found:', snapshot.size);

            // Get all existing conversations for current user
            const conversationsQuery = query(
                collection(db, 'conversations'),
                where('participants', 'array-contains', auth.currentUser?.uid)
            );
            const conversationsSnapshot = await getDocs(conversationsQuery);
            
            // Create a Set of user IDs that we already have conversations with
            const existingChatUserIds = new Set();
            conversationsSnapshot.forEach(doc => {
                const data = doc.data();
                data.participants.forEach((participantId: string) => {
                    if (participantId !== auth.currentUser?.uid) {
                        existingChatUserIds.add(participantId);
                    }
                });
            });
            
            const usersList: User[] = [];
            
            snapshot.forEach(doc => {
                try {
                    const data = doc.data();
                    // Don't include current user and users we already have chats with
                    if (doc.id !== auth.currentUser?.uid && !existingChatUserIds.has(doc.id)) {
                        usersList.push({
                            id: doc.id,
                            displayName: data.displayName || 'Unknown User',
                            photoURL: data.photoURL || '',
                            email: data.email || '',
                        });
                    }
                } catch (error) {
                    console.error('Error processing user document:', error);
                }
            });
            
            console.log('Filtered users list:', usersList);
            setUsers(usersList);
            setFilteredUsers(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error instanceof Error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = async (user: User) => {
        if (!auth.currentUser) return;

        const db = getFirestore();
        
        // Check if chat already exists
        const existingChatsQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', auth.currentUser.uid)
        );
        
        const existingChats = await getDocs(existingChatsQuery);
        const existingChat = existingChats.docs.find(doc => {
            const data = doc.data();
            return data.participants.includes(user.id);
        });

        if (existingChat) {
            // Navigate to existing chat
            navigation.navigate('ChatRoom', {
                chatId: existingChat.id,
                name: user.displayName,
                photoURL: user.photoURL
            });
            return;
        }

        // Create new chat if none exists
        navigation.navigate('ChatRoom', {
            chatId: undefined,
            name: user.displayName,
            photoURL: user.photoURL,
            userId: user.id,
        });
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <TouchableOpacity 
            style={styles.userItem}
            onPress={() => handleUserSelect(item)}
        >
            <View style={styles.avatarContainer}>
                {item.photoURL ? (
                    <Image 
                        source={{ uri: item.photoURL }} 
                        style={styles.avatar}
                    />
                ) : (
                    <Ionicons name="person-circle-outline" size={50} color="#666" />
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.displayName}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
    );

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Chat</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading users...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUserItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                />
            )}
        </Container>
    );
};

export default UserSelection;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 8,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
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
    },
}); 