import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';
import { MainButton } from '@/components/MainButton';

interface UserData {
    displayName: string;
    photoURL: string;
    email: string;
    weight?: number;
    height?: number;
    fitnessGoals?: string[];
}

const UserProfile = () => {
    const navigation = useNavigation() as any;
    const route = useRoute() as any;
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const defaultProfilePic = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    const [profilePicError, setProfilePicError] = useState(false);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = route.params?.userId;
                if (!userId) {
                    console.error('No user ID provided');
                    return;
                }

                const docRef = doc(firestore, 'users', userId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserData;
                    setUserData(data);
                    
                    // Handle Google profile photo URL
                    let photoUrl = data.photoURL;
                    if (photoUrl && photoUrl.includes('googleusercontent.com')) {
                        photoUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(photoUrl)}`;
                    }
                    setPhotoURL(photoUrl);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [route.params?.userId]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleStartChat = async () => {
        try {
            if (!auth.currentUser) return;
            
            const currentUserId = auth.currentUser.uid;
            const otherUserId = route.params?.userId;
            
            // Query for existing conversations
            const conversationsRef = collection(firestore, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', currentUserId)
            );
            
            const querySnapshot = await getDocs(q);
            let existingChatId = null;
            
            // Check if conversation exists
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.participants.includes(otherUserId)) {
                    existingChatId = doc.id;
                }
            });
            
            // Navigate to ChatRoom with either existing chatId or undefined (for new chat)
            navigation.navigate('ChatRoom', {
                chatId: existingChatId,
                userId: otherUserId,
                name: userData?.displayName,
                photoURL: userData?.photoURL
            });
        } catch (error) {
            console.error('Error checking for existing conversation:', error);
            // Fallback to creating new conversation
            navigation.navigate('ChatRoom', {
                userId: route.params?.userId,
                name: userData?.displayName,
                photoURL: userData?.photoURL
            });
        }
    };

    if (loading) {
        return (
            <Container>
                <Text>Loading...</Text>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container>
                <Text>User not found</Text>
            </Container>
        );
    }

    return (
        <Container style={{padding: 0}}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.title}>BodyTrack™</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                {/* Profile Picture and User Info */}
                <View style={styles.profileSection}>
                    <View style={styles.profilePicContainer}>
                        {profilePicError ? (
                            <View style={[styles.profilePic, styles.fallbackProfilePic]}>
                                <Text style={styles.fallbackProfileText}>
                                    {userData.displayName?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        ) : (
                            <Image
                                source={{ 
                                    uri: photoURL || defaultProfilePic
                                }}
                                style={styles.profilePic}
                                onError={(error) => {
                                    console.log('Image loading error:', error.nativeEvent);
                                    console.log('Failed photo URL:', photoURL);
                                    if (photoURL?.includes('allorigins.win')) {
                                        const directUrl = decodeURIComponent(photoURL.split('url=')[1]);
                                        setPhotoURL(directUrl);
                                    } else {
                                        setProfilePicError(true);
                                    }
                                }}
                            />
                        )}
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userData.displayName}</Text>
                        <Text style={styles.userEmail}>{userData.email}</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Current BMI</Text>
                        <Text style={styles.statValue}>
                            {userData.weight && userData.height 
                                ? ((userData.weight / ((userData.height / 100) ** 2)).toFixed(1))
                                : 'N/A'}
                        </Text>
                        <Text style={styles.statChange}>Based on current weight and height</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Weight</Text>
                        <Text style={styles.statValue}>{userData.weight || 'N/A'} kg</Text>
                        <Text style={styles.statChange}>Current weight</Text>
                    </View>
                </View>

                {/* Fitness Goals */}
                {userData.fitnessGoals && userData.fitnessGoals.length > 0 && (
                    <View style={styles.goalsCard}>
                        <Text style={styles.goalsTitle}>Fitness Goals</Text>
                        <View style={styles.goalsContainer}>
                            {userData.fitnessGoals.map((goal: string) => (
                                <View key={goal} style={styles.goalChip}>
                                    <Text style={styles.goalChipText}>{goal}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Start Chat Button */}
                <TouchableOpacity 
                    style={styles.chatButton}
                    onPress={handleStartChat}
                >
                    <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
                    <Text style={styles.chatButtonText}>Start Chat</Text>
                </TouchableOpacity>
            </ScrollView>
        </Container>
    );
};

export default UserProfile;

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 20,
        zIndex: 1,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
    },
    profilePicContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    profilePic: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    fallbackProfilePic: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackProfileText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    userInfo: {
        marginLeft: 15,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 16,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        marginVertical: 4,
    },
    statChange: {
        fontSize: 12,
        color: '#666',
    },
    goalsCard: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 20,
    },
    goalsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    goalsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    goalChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    goalChipText: {
        fontSize: 14,
        color: '#333',
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    chatButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
}); 