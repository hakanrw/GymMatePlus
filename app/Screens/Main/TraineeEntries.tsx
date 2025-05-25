import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs, getFirestore, doc, getDoc } from '@firebase/firestore';
import { auth } from '../../firebaseConfig';

interface GymEntry {
    id: string;
    userId: string;
    gymId: number;
    entryTime: Date;
    exitTime: Date | null;
    duration: number | null;
    createdAt: Date;
    userName?: string;
}

const TraineeEntries = () => {
    const navigation = useNavigation() as any;
    const [entries, setEntries] = useState<GymEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [traineeIds, setTraineeIds] = useState<string[]>([]);

    useEffect(() => {
        fetchTraineeIds();
    }, []);

    useEffect(() => {
        if (traineeIds.length > 0) {
            fetchTraineeEntries();
        } else {
            setLoading(false);
        }
    }, [traineeIds]);

    const fetchTraineeIds = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to view trainee entries');
            return;
        }

        try {
            // Get current user data to check if they're a coach
            const userDoc = await getDoc(doc(getFirestore(), 'users', auth.currentUser.uid));
            if (!userDoc.exists()) {
                Alert.alert('Error', 'User data not found');
                return;
            }

            const userData = userDoc.data();
            if (userData.role !== 'coach' && userData.accountType !== 'coach') {
                Alert.alert('Error', 'Only coaches can view trainee entries');
                navigation.goBack();
                return;
            }

            // Get trainee IDs from the coach's trainees array
            const traineeIds = userData.trainees || [];
            setTraineeIds(traineeIds);
        } catch (error) {
            console.error('Error fetching trainee IDs:', error);
            Alert.alert('Error', 'Failed to load trainee data');
        }
    };

    const fetchTraineeEntries = async () => {
        try {
            const gymentriesRef = collection(getFirestore(), 'gymentries');
            const allEntries: GymEntry[] = [];


            // Fetch entries for each trainee
            for (const traineeId of traineeIds) {
                try {
                    const q = query(
                        gymentriesRef,
                        where('userId', '==', traineeId),
                        orderBy('entryTime', 'desc')
                    );

                    const querySnapshot = await getDocs(q);
                    
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        allEntries.push({
                            id: doc.id,
                            userId: data.userId,
                            gymId: data.gymId,
                            entryTime: data.entryTime.toDate(),
                            exitTime: data.exitTime ? data.exitTime.toDate() : null,
                            duration: data.duration,
                            createdAt: data.createdAt.toDate(),
                        });
                    });
                } catch (indexError) {
                    console.log('Index not ready for trainee, using fallback query:', traineeId, indexError);
                    
                    // Fallback query without orderBy
                    const fallbackQuery = query(
                        gymentriesRef,
                        where('userId', '==', traineeId)
                    );
                    
                    const querySnapshot = await getDocs(fallbackQuery);
                    
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        allEntries.push({
                            id: doc.id,
                            userId: data.userId,
                            gymId: data.gymId,
                            entryTime: data.entryTime.toDate(),
                            exitTime: data.exitTime ? data.exitTime.toDate() : null,
                            duration: data.duration,
                            createdAt: data.createdAt.toDate(),
                        });
                    });
                }
            }

            console.log('Total entries found:', allEntries.length);

            // Sort all entries by entryTime descending
            allEntries.sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());

            // Fetch user names for each entry
            const entriesWithNames = await Promise.all(
                allEntries.map(async (entry) => {
                    try {
                        const userDoc = await getDoc(doc(getFirestore(), 'users', entry.userId));
                        const userName = userDoc.exists() ? userDoc.data().displayName || 'Unknown User' : 'Unknown User';
                        return { ...entry, userName };
                    } catch (error) {
                        console.error('Error fetching user name:', error);
                        return { ...entry, userName: 'Unknown User' };
                    }
                })
            );

            setEntries(entriesWithNames);
        } catch (error) {
            Alert.alert('Error', 'Failed to load trainee entries');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'In progress';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const renderEntry = ({ item }: { item: GymEntry }) => (
        <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
                <View style={styles.userInfo}>
                    <Ionicons name="person" size={16} color="#007AFF" />
                    <Text style={styles.userText}>{item.userName}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(item.entryTime)}</Text>
            </View>
            
            <View style={styles.gymInfo}>
                <Ionicons name="fitness" size={16} color="#28a745" />
                <Text style={styles.gymText}>Gym {item.gymId}</Text>
            </View>
            
            <View style={styles.entryDetails}>
                <View style={styles.timeRow}>
                    <View style={styles.timeInfo}>
                        <Ionicons name="log-in" size={14} color="#28a745" />
                        <Text style={styles.timeLabel}>Entry:</Text>
                        <Text style={styles.timeValue}>{formatTime(item.entryTime)}</Text>
                    </View>
                    
                    <View style={styles.timeInfo}>
                        <Ionicons 
                            name="log-out" 
                            size={14} 
                            color={item.exitTime ? "#dc3545" : "#999"} 
                        />
                        <Text style={styles.timeLabel}>Exit:</Text>
                        <Text style={styles.timeValue}>
                            {item.exitTime ? formatTime(item.exitTime) : 'In progress'}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.durationRow}>
                    <Ionicons name="time" size={14} color="#6c757d" />
                    <Text style={styles.durationLabel}>Duration:</Text>
                    <Text style={[
                        styles.durationValue,
                        !item.exitTime && styles.inProgressText
                    ]}>
                        {formatDuration(item.duration)}
                    </Text>
                </View>
            </View>
        </View>
    );

    const handleBack = () => {
        navigation.goBack();
    };

    if (loading) {
        return (
            <Container>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Trainee Entries</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Trainee Entries</Text>
            </View>

            {entries.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Trainee Entries</Text>
                    <Text style={styles.emptyText}>
                        Your trainees haven't used the gym yet, or you don't have any trainees assigned.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    renderItem={renderEntry}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </Container>
    );
};

export default TraineeEntries;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 16,
    },
    entryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 6,
        color: '#007AFF',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    gymInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    gymText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
        color: '#28a745',
    },
    entryDetails: {
        gap: 6,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        marginRight: 4,
    },
    timeValue: {
        fontSize: 12,
        fontWeight: '500',
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    durationLabel: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        marginRight: 4,
    },
    durationValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007AFF',
    },
    inProgressText: {
        color: '#28a745',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        lineHeight: 24,
    },
}); 