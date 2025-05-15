import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
    Image,
    ImageBackground,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from 'react-native-chart-kit';
import { auth } from '../../firebaseConfig';
import { doc, getDoc, getFirestore } from '@firebase/firestore';
import { MainButton } from '@/components/MainButton';
import { signOut } from 'firebase/auth';

const Profile = () => {
    const navigation = useNavigation() as any;
    const [selectedTabs, setSelectedTabs] = useState<{ BMI: boolean; Muscle: boolean }>({
        BMI: true,
        Muscle: false,
    });
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const defaultProfilePic = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    const [profilePicError, setProfilePicError] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                console.log('Current User:', auth.currentUser);
                console.log('Photo URL:', auth.currentUser.photoURL);
                const docRef = doc(getFirestore(), 'users', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);


    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Navigation will be handled by the auth state listener in App.tsx
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const toggleTab = (tab: 'BMI' | 'Muscle') => {
        setSelectedTabs(prev => ({ ...prev, [tab]: !prev[tab] }));
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const chartData = {
        labels: ['Jan 23', '24', '25', '26', '27', '28', '29', '30'],
        datasets: [
            {
                data: [20.5, 20, 19.4, 19, 18.8, 18.5, 18.3, 18.1],
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            },
        ],
    };

    if (loading) {
        return (
            <Container>
                <Text>Loading...</Text>
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
                        <Image
                            source={{ 
                                uri: auth.currentUser?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                            }}
                            style={styles.profilePic}
                            onError={(error) => {
                                console.log('Image loading error:', error.nativeEvent);
                                setProfilePicError(true);
                            }}
                        />
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
                        <Text style={styles.statChange}>-12% over last month</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Weight</Text>
                        <Text style={styles.statValue}>{userData?.weight || 'N/A'} kg</Text>
                        <Text style={styles.statChange}>-12% month over month</Text>
                    </View>
                </View>

                {/* Graph Tabs */}
                <View style={styles.tabContainer}>
                    {['BMI', 'Muscle'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => toggleTab(tab as 'BMI' | 'Muscle')}
                            style={[
                                styles.Button,
                                selectedTabs[tab as 'BMI' | 'Muscle'] && styles.selectedTab,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTabs[tab as 'BMI' | 'Muscle'] && styles.selectedTabText,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Graph */}
                <View style={styles.graphContainer}>
                    <Text style={styles.graphTitle}>BMI History</Text>
                    <LineChart
                        data={chartData}
                        width={Dimensions.get('window').width - 48}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: '#007AFF',
                            },
                        }}
                        bezier
                        style={{
                            borderRadius: 16,
                            marginTop: 8,
                            alignSelf: 'center',
                        }}
                    />
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
    },
    Button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginRight: 10,
    },
    selectedTab: {
        backgroundColor: '#000',
    },
    tabText: {
        color: '#000',
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
    graphTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
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
});
