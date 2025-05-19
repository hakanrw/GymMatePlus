import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteField, arrayUnion } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';
import { MainButton } from '@/components/MainButton';

type AccountType = 'user' | 'coach' | 'admin';

interface UserData {
    displayName: string;
    photoURL: string;
    email: string;
    weight?: number;
    height?: number;
    fitnessGoals?: string[];
    accountType: AccountType;
    coach?: string;
    trainees?: string[];
}

const UserProfile = () => {
    const navigation = useNavigation() as any;
    const route = useRoute() as any;
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const defaultProfilePic = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    const [profilePicError, setProfilePicError] = useState(false);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!auth.currentUser) return;
            const adminDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            setIsAdmin(adminDoc.data()?.accountType === 'admin');
        };
        checkAdminStatus();
    }, []);

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

    const handleToggleCoachStatus = async () => {
        if (!userData || !route.params?.userId) return;

        const newAccountType: AccountType = userData.accountType === 'coach' ? 'user' : 'coach';
        const userRef = doc(firestore, 'users', route.params.userId);
        let assignedCoach: any = null;

        try {
            if (newAccountType === 'coach') {
                // Promoting to coach
                // 1. If they had a coach, remove them from that coach's trainees list
                if (userData.coach) {
                    const previousCoachRef = doc(firestore, 'users', userData.coach);
                    const previousCoachDoc = await getDoc(previousCoachRef);
                    if (previousCoachDoc.exists()) {
                        const trainees = previousCoachDoc.data().trainees || [];
                        await updateDoc(previousCoachRef, {
                            trainees: trainees.filter((id: string) => id !== route.params?.userId)
                        });
                    }
                }

                // 2. Update user document: remove coach field, add empty trainees array
                await updateDoc(userRef, {
                    accountType: newAccountType,
                    trainees: [],
                    coach: deleteField() // Use Firebase's deleteField() to remove the field
                });
            } else {
                // Demoting to user
                // 1. Reassign their trainees to other coaches
                if (userData.trainees && userData.trainees.length > 0) {
                    const coachesQuery = query(
                        collection(firestore, 'users'),
                        where('accountType', '==', 'coach'),
                        where('__name__', '!=', route.params.userId)
                    );
                    const coachesSnapshot = await getDocs(coachesQuery);
                    
                    if (coachesSnapshot.empty) {
                        // If no other coaches available, we can't demote this coach
                        throw new Error('Cannot demote the last coach. There must be at least one coach available to handle trainees.');
                    }

                    const coaches = coachesSnapshot.docs;
                    // Reassign each trainee to a random coach
                    for (const traineeId of userData.trainees) {
                        const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];
                        // Update trainee's coach
                        await updateDoc(doc(firestore, 'users', traineeId), {
                            coach: randomCoach.id
                        });
                        // Add trainee to new coach's trainees list
                        await updateDoc(doc(firestore, 'users', randomCoach.id), {
                            trainees: arrayUnion(traineeId)
                        });
                    }
                }

                // 2. Find a random coach for the demoted user
                const coachesQuery = query(
                    collection(firestore, 'users'),
                    where('accountType', '==', 'coach'),
                    where('__name__', '!=', route.params.userId)
                );
                const coachesSnapshot = await getDocs(coachesQuery);
                
                if (coachesSnapshot.empty) {
                    throw new Error('Cannot demote the last coach. There must be at least one other coach available.');
                }

                const coaches = coachesSnapshot.docs;
                assignedCoach = coaches[Math.floor(Math.random() * coaches.length)];

                // 3. Update user document: remove trainees field, add coach field
                await updateDoc(userRef, {
                    accountType: newAccountType,
                    trainees: deleteField(), // Remove trainees field
                    coach: assignedCoach.id
                });

                // 4. Add user to their new coach's trainees list
                await updateDoc(doc(firestore, 'users', assignedCoach.id), {
                    trainees: arrayUnion(route.params.userId)
                });
            }

            // Update local state
            setUserData(prev => prev ? {
                ...prev,
                accountType: newAccountType,
                trainees: newAccountType === 'coach' ? [] : undefined,
                coach: newAccountType === 'user' ? assignedCoach?.id : undefined
            } : null);
            
            Alert.alert(
                'Success',
                `User has been ${newAccountType === 'coach' ? 'promoted to coach' : 'demoted to user'}`
            );
        } catch (error) {
            console.error('Error updating coach status:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to update user status'
            );
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

                {/* Admin Controls */}
                {isAdmin && userData?.accountType !== 'admin' && (
                    <TouchableOpacity 
                        style={[styles.adminButton, userData?.accountType === 'coach' ? styles.demoteButton : styles.promoteButton]}
                        onPress={handleToggleCoachStatus}
                    >
                        <Ionicons 
                            name={userData?.accountType === 'coach' ? 'arrow-down-circle' : 'arrow-up-circle'} 
                            size={24} 
                            color="#fff" 
                        />
                        <Text style={styles.adminButtonText}>
                            {userData?.accountType === 'coach' ? 'Demote to User' : 'Promote to Coach'}
                        </Text>
                    </TouchableOpacity>
                )}
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
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
    },
    promoteButton: {
        backgroundColor: '#28a745',
    },
    demoteButton: {
        backgroundColor: '#dc3545',
    },
    adminButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
}); 