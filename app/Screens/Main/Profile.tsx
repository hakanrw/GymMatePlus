import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
    Image,
    Alert,
    Modal,
    TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart } from 'react-native-chart-kit';
import { auth } from '../../firebaseConfig';
import { doc, getDoc, getFirestore, collection, addDoc, query, orderBy, limit, where, getDocs } from '@firebase/firestore';
import { MainButton } from '@/components/MainButton';
import { signOut } from 'firebase/auth';

interface FitnessData {
    id?: string;
    userId: string;
    type: 'weight' | 'workout' | 'strength';
    value: number;
    date: Date;
    exerciseName?: string; // For strength tracking
    reps?: number; // For strength tracking
    sets?: number; // For strength tracking
}

interface ChartDataset {
    data: number[];
    color?: (opacity?: number) => string;
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

const Profile = () => {
    const navigation = useNavigation() as any;
    const [selectedTab, setSelectedTab] = useState<'weight' | 'bmi' | 'workouts' | 'strength'>('weight');
    const [userData, setUserData] = useState<any>(null);
    const [fitnessData, setFitnessData] = useState<FitnessData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddDataModal, setShowAddDataModal] = useState(false);
    const [newWeight, setNewWeight] = useState('');
    const [newExercise, setNewExercise] = useState('');
    const [newWeight2, setNewWeight2] = useState(''); // For strength tracking
    const [newReps, setNewReps] = useState('');
    const [newSets, setNewSets] = useState('');
    const defaultProfilePic = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    const [profilePicError, setProfilePicError] = useState(false);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const docRef = doc(getFirestore(), 'users', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    
                    // Handle Google profile photo URL
                    let photoUrl = data.photoURL || auth.currentUser.photoURL;
                    if (photoUrl && photoUrl.includes('googleusercontent.com')) {
                        photoUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(photoUrl)}`;
                    }
                    setPhotoURL(photoUrl);
                }
                
                // Fetch fitness data
                await fetchFitnessData();
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchFitnessData = async () => {
        if (!auth.currentUser) return;
        
        try {
            const fitnessRef = collection(getFirestore(), 'fitnessData');
            const q = query(
                fitnessRef,
                where('userId', '==', auth.currentUser.uid),
                orderBy('date', 'desc'),
                limit(30)
            );
            
            const querySnapshot = await getDocs(q);
            const data: FitnessData[] = [];
            
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                data.push({
                    id: doc.id,
                    ...docData,
                    date: docData.date.toDate()
                } as FitnessData);
            });
            
            setFitnessData(data);
        } catch (error) {
            console.error('Error fetching fitness data:', error);
        }
    };

    const addFitnessData = async (type: 'weight' | 'workout' | 'strength', value: number, exerciseName?: string, reps?: number, sets?: number) => {
        if (!auth.currentUser) return;
        
        try {
            const fitnessRef = collection(getFirestore(), 'fitnessData');
            const newData: Omit<FitnessData, 'id'> = {
                userId: auth.currentUser.uid,
                type,
                value,
                date: new Date(),
                ...(exerciseName && { exerciseName }),
                ...(reps && { reps }),
                ...(sets && { sets })
            };
            
            await addDoc(fitnessRef, newData);
            await fetchFitnessData(); // Refresh data
            Alert.alert('Success', 'Data added successfully!');
        } catch (error) {
            console.error('Error adding fitness data:', error);
            Alert.alert('Error', 'Failed to add data. Please try again.');
        }
    };

    const handleAddWeight = async () => {
        const weight = parseFloat(newWeight);
        if (isNaN(weight) || weight <= 0) {
            Alert.alert('Error', 'Please enter a valid weight');
            return;
        }
        
        await addFitnessData('weight', weight);
        setNewWeight('');
        setShowAddDataModal(false);
    };

    const handleAddWorkout = async () => {
        await addFitnessData('workout', 1); // Just count workouts
        setShowAddDataModal(false);
    };

    const handleAddStrength = async () => {
        const weight = parseFloat(newWeight2);
        const reps = parseInt(newReps);
        const sets = parseInt(newSets);
        
        if (isNaN(weight) || isNaN(reps) || isNaN(sets) || !newExercise.trim()) {
            Alert.alert('Error', 'Please fill all fields with valid values');
            return;
        }
        
        await addFitnessData('strength', weight, newExercise.trim(), reps, sets);
        setNewExercise('');
        setNewWeight2('');
        setNewReps('');
        setNewSets('');
        setShowAddDataModal(false);
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const getChartData = (): ChartData => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        switch (selectedTab) {
            case 'weight':
                const weightData = fitnessData
                    .filter(d => d.type === 'weight' && d.date >= thirtyDaysAgo)
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(-8); // Last 8 entries
                
                if (weightData.length === 0) {
                    return {
                        labels: ['No Data'],
                        datasets: [{ data: [userData?.weight || 70] }]
                    };
                }
                
                return {
                    labels: weightData.map(d => `${d.date.getDate()}/${d.date.getMonth() + 1}`),
                    datasets: [{ 
                        data: weightData.map(d => d.value),
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`
                    }]
                };
                
            case 'bmi':
                const bmiData = fitnessData
                    .filter(d => d.type === 'weight' && d.date >= thirtyDaysAgo)
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(-8);
                
                if (bmiData.length === 0 || !userData?.height) {
                    const currentBMI = userData?.weight && userData?.height 
                        ? userData.weight / ((userData.height / 100) ** 2)
                        : 22;
                    return {
                        labels: ['Current'],
                        datasets: [{ data: [currentBMI] }]
                    };
                }
                
                return {
                    labels: bmiData.map(d => `${d.date.getDate()}/${d.date.getMonth() + 1}`),
                    datasets: [{ 
                        data: bmiData.map(d => userData?.height ? d.value / ((userData.height / 100) ** 2) : 22),
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`
                    }]
                };
                
            case 'workouts':
                // Group workouts by week
                const workoutsByWeek: { [key: string]: number } = {};
                const workoutData = fitnessData.filter(d => d.type === 'workout' && d.date >= thirtyDaysAgo);
                
                for (let i = 0; i < 4; i++) {
                    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
                    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const weekLabel = `W${4-i}`;
                    
                    workoutsByWeek[weekLabel] = workoutData.filter(d => 
                        d.date >= weekStart && d.date < weekEnd
                    ).length;
                }
                
                return {
                    labels: Object.keys(workoutsByWeek),
                    datasets: [{ 
                        data: Object.values(workoutsByWeek),
                        color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`
                    }]
                };
                
            case 'strength':
                // Show max weight for most recent exercise
                const strengthData = fitnessData
                    .filter(d => d.type === 'strength' && d.date >= thirtyDaysAgo)
                    .sort((a, b) => a.date.getTime() - b.date.getTime());
                
                if (strengthData.length === 0) {
                    return {
                        labels: ['No Data'],
                        datasets: [{ data: [0] }]
                    };
                }
                
                // Group by exercise and get latest entries
                const exerciseGroups: { [key: string]: FitnessData[] } = {};
                strengthData.forEach(d => {
                    if (d.exerciseName) {
                        if (!exerciseGroups[d.exerciseName]) {
                            exerciseGroups[d.exerciseName] = [];
                        }
                        exerciseGroups[d.exerciseName].push(d);
                    }
                });
                
                // Get the most tracked exercise
                const mostTrackedExercise = Object.keys(exerciseGroups).reduce((a, b) => 
                    exerciseGroups[a].length > exerciseGroups[b].length ? a : b
                );
                
                const exerciseData = exerciseGroups[mostTrackedExercise]?.slice(-6) || [];
                
                return {
                    labels: exerciseData.map((d, i) => `S${i + 1}`),
                    datasets: [{ 
                        data: exerciseData.map(d => d.value),
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`
                    }]
                };
                
            default:
                return { labels: ['No Data'], datasets: [{ data: [0] }] };
        }
    };

    const getGraphTitle = () => {
        switch (selectedTab) {
            case 'weight': return 'Weight Progress (kg)';
            case 'bmi': return 'BMI History';
            case 'workouts': return 'Weekly Workouts';
            case 'strength': return 'Strength Progress (kg)';
            default: return 'Progress';
        }
    };

    const getAddDataModalContent = () => {
        switch (selectedTab) {
            case 'weight':
                return (
                    <View>
                        <Text style={styles.modalTitle}>Add Weight Entry</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Weight (kg)"
                            value={newWeight}
                            onChangeText={setNewWeight}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={handleAddWeight}>
                            <Text style={styles.modalButtonText}>Add Weight</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'workouts':
                return (
                    <View>
                        <Text style={styles.modalTitle}>Log Workout</Text>
                        <Text style={styles.modalDescription}>This will add one workout to today's count</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleAddWorkout}>
                            <Text style={styles.modalButtonText}>Log Workout</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'strength':
                return (
                    <View>
                        <Text style={styles.modalTitle}>Add Strength Entry</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Exercise name"
                            value={newExercise}
                            onChangeText={setNewExercise}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Weight (kg)"
                            value={newWeight2}
                            onChangeText={setNewWeight2}
                            keyboardType="numeric"
                        />
                        <View style={styles.modalRow}>
                            <TextInput
                                style={[styles.modalInput, styles.modalInputHalf]}
                                placeholder="Sets"
                                value={newSets}
                                onChangeText={setNewSets}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.modalInput, styles.modalInputHalf]}
                                placeholder="Reps"
                                value={newReps}
                                onChangeText={setNewReps}
                                keyboardType="numeric"
                            />
                        </View>
                        <TouchableOpacity style={styles.modalButton} onPress={handleAddStrength}>
                            <Text style={styles.modalButtonText}>Add Entry</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return (
                    <View>
                        <Text style={styles.modalTitle}>BMI Tracking</Text>
                        <Text style={styles.modalDescription}>BMI is calculated from your weight entries. Add weight data to see BMI progress.</Text>
                    </View>
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

    const chartData = getChartData();

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
                                    {auth.currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        ) : (
                            <Image
                                source={{ 
                                    uri: photoURL || defaultProfilePic
                                }}
                                style={styles.profilePic}
                                onError={(error) => {
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
                        <Text style={styles.userName}>{auth.currentUser?.displayName || 'User'}</Text>
                        <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Current BMI</Text>
                        <Text style={styles.statValue}>
                            {userData?.weight && userData?.height 
                                ? ((userData.weight / ((userData.height / 100) ** 2)).toFixed(1))
                                : 'N/A'}
                        </Text>
                        <Text style={styles.statChange}>
                            {userData?.weight && userData?.height 
                                ? (userData.weight / ((userData.height / 100) ** 2) < 18.5 ? 'Underweight' :
                                   userData.weight / ((userData.height / 100) ** 2) < 25 ? 'Normal' :
                                   userData.weight / ((userData.height / 100) ** 2) < 30 ? 'Overweight' : 'Obese')
                                : 'Based on current data'}
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Weight</Text>
                        <Text style={styles.statValue}>{userData?.weight || 'N/A'} kg</Text>
                        <Text style={styles.statChange}>
                            {fitnessData.filter(d => d.type === 'weight').length > 0 
                                ? `${fitnessData.filter(d => d.type === 'weight').length} entries logged`
                                : 'No entries yet'}
                        </Text>
                    </View>
                </View>

                {/* Graph Tabs */}
                <View style={styles.tabContainer}>
                    {[
                        { key: 'weight', label: 'Weight', icon: 'fitness' },
                        { key: 'bmi', label: 'BMI', icon: 'analytics' },
                        { key: 'workouts', label: 'Workouts', icon: 'barbell' },
                        { key: 'strength', label: 'Strength', icon: 'trophy' }
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setSelectedTab(tab.key as any)}
                            style={[
                                styles.tabButton,
                                selectedTab === tab.key && styles.selectedTab,
                            ]}
                        >
                            <Ionicons 
                                name={tab.icon as any} 
                                size={16} 
                                color={selectedTab === tab.key ? '#fff' : '#666'} 
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTab === tab.key && styles.selectedTabText,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Graph */}
                <View style={styles.graphContainer}>
                    <View style={styles.graphHeader}>
                        <Text style={styles.graphTitle}>{getGraphTitle()}</Text>
                        {selectedTab !== 'bmi' && (
                            <TouchableOpacity 
                                style={styles.addButton}
                                onPress={() => setShowAddDataModal(true)}
                            >
                                <Ionicons name="add" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {selectedTab === 'workouts' ? (
                        <BarChart
                            data={chartData}
                            width={Dimensions.get('window').width - 48}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: '#fff',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                            }}
                            style={{
                                borderRadius: 16,
                                marginTop: 8,
                                alignSelf: 'center',
                            }}
                        />
                    ) : (
                        <LineChart
                            data={chartData}
                            width={Dimensions.get('window').width - 48}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#fff',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                decimalPlaces: selectedTab === 'bmi' ? 1 : 0,
                                color: chartData.datasets[0].color || ((opacity = 1) => `rgba(0, 122, 255, ${opacity})`),
                                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                                propsForDots: {
                                    r: '4',
                                    strokeWidth: '2',
                                    stroke: chartData.datasets[0].color ? chartData.datasets[0].color(1) : '#007AFF',
                                },
                            }}
                            bezier
                            style={{
                                borderRadius: 16,
                                marginTop: 8,
                                alignSelf: 'center',
                            }}
                        />
                    )}
                </View>

                {/* Fitness Goals */}
                <View style={styles.goalsCard}>
                    <Text style={styles.goalsTitle}>Fitness Goals</Text>
                    <View style={styles.goalsContainer}>
                        {userData?.fitnessGoals?.map((goal: string) => (
                            <View key={goal} style={styles.goalChip}>
                                <Text style={styles.goalChipText}>{goal}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity 
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                >
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Add Data Modal */}
            <Modal
                visible={showAddDataModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAddDataModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {getAddDataModalContent()}
                        <TouchableOpacity 
                            style={styles.modalCancelButton}
                            onPress={() => setShowAddDataModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Container>
    );
};

export default Profile;

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
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        gap: 4,
    },
    selectedTab: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '500',
    },
    selectedTabText: {
        color: '#fff',
    },
    graphContainer: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 20,
    },
    graphHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    graphTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    goalsCard: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    signOutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    modalRow: {
        flexDirection: 'row',
        gap: 8,
    },
    modalInputHalf: {
        flex: 1,
    },
    modalButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalCancelButton: {
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    modalCancelText: {
        color: '#666',
        fontSize: 16,
    },
});
