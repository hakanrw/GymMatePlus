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
import { collection, query, where, orderBy, getDocs, getFirestore } from '@firebase/firestore';
import { auth } from '../../firebaseConfig';

interface GymEntry {
    id: string;
    userId: string;
    gymId: number;
    entryTime: Date;
    exitTime: Date | null;
    duration: number | null;
    createdAt: Date;
}

const EntryHistory = () => {
    const navigation = useNavigation() as any;
    const [entries, setEntries] = useState<GymEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEntryHistory();
    }, []);

    const fetchEntryHistory = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'You must be logged in to view entry history');
            return;
        }

        try {
            const gymentriesRef = collection(getFirestore(), 'gymentries');
            
            // Try the optimized query first (requires index)
            try {
                const q = query(
                    gymentriesRef,
                    where('userId', '==', auth.currentUser.uid),
                    orderBy('entryTime', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const entriesData: GymEntry[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    entriesData.push({
                        id: doc.id,
                        userId: data.userId,
                        gymId: data.gymId,
                        entryTime: data.entryTime.toDate(),
                        exitTime: data.exitTime ? data.exitTime.toDate() : null,
                        duration: data.duration,
                        createdAt: data.createdAt.toDate(),
                    });
                });

                setEntries(entriesData);
            } catch (indexError) {
                console.log('Index not ready, using fallback query:', indexError);
                
                // Fallback: simpler query without orderBy (doesn't require index)
                const fallbackQuery = query(
                    gymentriesRef,
                    where('userId', '==', auth.currentUser.uid)
                );
                
                const querySnapshot = await getDocs(fallbackQuery);
                const entriesData: GymEntry[] = [];
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    entriesData.push({
                        id: doc.id,
                        userId: data.userId,
                        gymId: data.gymId,
                        entryTime: data.entryTime.toDate(),
                        exitTime: data.exitTime ? data.exitTime.toDate() : null,
                        duration: data.duration,
                        createdAt: data.createdAt.toDate(),
                    });
                });
                
                // Sort manually by entryTime descending
                entriesData.sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());
                setEntries(entriesData);
            }
        } catch (error) {
            console.error('Error fetching entry history:', error);
            Alert.alert('Error', 'Failed to load entry history');
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
                <View style={styles.gymInfo}>
                    <Ionicons name="fitness" size={20} color="#007AFF" />
                    <Text style={styles.gymText}>Gym {item.gymId}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(item.entryTime)}</Text>
            </View>
            
            <View style={styles.entryDetails}>
                <View style={styles.timeRow}>
                    <View style={styles.timeInfo}>
                        <Ionicons name="log-in" size={16} color="#28a745" />
                        <Text style={styles.timeLabel}>Entry:</Text>
                        <Text style={styles.timeValue}>{formatTime(item.entryTime)}</Text>
                    </View>
                    
                    <View style={styles.timeInfo}>
                        <Ionicons 
                            name="log-out" 
                            size={16} 
                            color={item.exitTime ? "#dc3545" : "#999"} 
                        />
                        <Text style={styles.timeLabel}>Exit:</Text>
                        <Text style={styles.timeValue}>
                            {item.exitTime ? formatTime(item.exitTime) : 'In progress'}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.durationRow}>
                    <Ionicons name="time" size={16} color="#6c757d" />
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
                    <Text style={styles.title}>Entry History</Text>
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
                <Text style={styles.title}>Entry History</Text>
            </View>

            {entries.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="fitness" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Gym Entries</Text>
                    <Text style={styles.emptyText}>
                        Start using the QR scanner to track your gym visits!
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

export default EntryHistory;

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
        marginBottom: 12,
    },
    gymInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gymText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: '#007AFF',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    entryDetails: {
        gap: 8,
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
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        marginRight: 4,
    },
    timeValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    durationLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        marginRight: 4,
    },
    durationValue: {
        fontSize: 14,
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