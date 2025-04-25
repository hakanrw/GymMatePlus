import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import {Ionicons} from "@expo/vector-icons";
import { LineChart } from 'react-native-chart-kit';
const Profile = () => {
    const navigation = useNavigation() as any;
    const [selectedTabs, setSelectedTabs] = useState<{ BMI: boolean; Muscle: boolean }>({
        BMI: false,
        Muscle: false,
    });
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
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // optional
            },
        ],
    };


    return (
        <Container style={{padding: 0}}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.title}>BodyTrack™</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.profilePicContainer}>
                    <Image
                        source={{ uri: 'https://storage.googleapis.com/ares-profile-pictures/default/egefitness-158fb1d6e685ea748de869c764598071.jpg' }} // Replace this with actual image source
                        style={styles.profilePic}
                    />
                </View>
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
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Current BMI</Text>
                        <Text style={styles.statValue}>19</Text>
                        <Text style={styles.statChange}>-12% over last month</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Weight</Text>
                        <Text style={styles.statValue}>68</Text>
                        <Text style={styles.statChange}>-12% month over month</Text>
                    </View>
                </View>
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
                <View style={styles.userCard}>
                    <Text style={styles.userSectionTitle}>Title</Text>

                    <View style={styles.userRow}>
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
                            style={styles.userAvatar}
                        />
                        <View>
                            <Text style={styles.userName}>Elynn Lee</Text>
                            <Text style={styles.userEmail}>email@fakedomain.net</Text>
                        </View>
                    </View>

                    <View style={styles.userRow}>
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/men/2.jpg' }}
                            style={styles.userAvatar}
                        />
                        <View>
                            <Text style={styles.userName}>Oscar Dum</Text>
                            <Text style={styles.userEmail}>email@fakedomain.net</Text>
                        </View>
                    </View>
                </View>
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
    profilePicContainer: {
        position: 'absolute',
        top: 0,
        right: 20,
        zIndex: 1,
    },
    profilePic: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        left: 15,
        marginBottom: 20,
    },
    Button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginHorizontal: 5,
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
    section: {
        paddingHorizontal: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 16,
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
    graphContainer: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },

    graphTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    userCard: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },

    userSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },

    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },

    userName: {
        fontSize: 14,
        fontWeight: '500',
    },

    userEmail: {
        fontSize: 12,
        color: '#666',
    },

});
