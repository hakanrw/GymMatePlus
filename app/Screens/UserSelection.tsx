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
import { auth } from '../firebaseConfig';
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
            const usersQuery = query(
                collection(db, 'users'),
                where('onBoardingComplete', '==', true)
            );
            const snapshot = await getDocs(usersQuery);
            console.log('Number of users found:', snapshot.size);
            
            const usersList: User[] = [];
            
            snapshot.forEach(doc => {
                try {
                    const data = doc.data();
                    console.log('User data:', { id: doc.id, ...data });
                    // Don't include current user
                    if (doc.id !== auth.currentUser?.uid) {
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
            // Log more details about the error
            if (error instanceof Error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (user: User) => {
        navigation.navigate('ChatRoom', {
            chatId: undefined, // Will be created in Chat screen
            name: user.displayName,
            photoURL: user.photoURL,
            userId: user.id, // Pass the selected user's ID
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