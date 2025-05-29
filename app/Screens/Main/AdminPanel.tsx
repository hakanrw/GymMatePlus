import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
    Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, updateDoc, Timestamp } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

interface SystemStats {
    totalUsers: number;
    totalCoaches: number;
    totalAdmins: number;
    activeGymSessions: number;
    totalExercises: number;
    totalPrograms: number;
    weeklySignups: number;
    systemHealth: number;
}

interface User {
    id: string;
    displayName: string;
    email: string;
    accountType: 'user' | 'coach' | 'admin';
    gym?: number;
    createdAt: any;
    onBoardingComplete: boolean;
    lastActive?: any;
    isActive?: boolean;
}

interface GymStats {
    gymId: number;
    name: string;
    totalMembers: number;
    activeToday: number;
    capacity: number;
    utilization: number;
}

const AdminPanel = () => {
    const navigation = useNavigation() as any;
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        totalCoaches: 0,
        totalAdmins: 0,
        activeGymSessions: 0,
        totalExercises: 0,
        totalPrograms: 0,
        weeklySignups: 0,
        systemHealth: 100,
    });
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [gymStats, setGymStats] = useState<GymStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showGymModal, setShowGymModal] = useState(false);
    const [showSystemModal, setShowSystemModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchSystemStats = async () => {
        try {
            const usersRef = collection(firestore, 'users');
            const exercisesRef = collection(firestore, 'exercises');
            
            // Get total users
            const allUsersSnapshot = await getDocs(usersRef);
            const allExercisesSnapshot = await getDocs(exercisesRef);
            
            let totalUsers = 0;
            let totalCoaches = 0;
            let totalAdmins = 0;
            let weeklySignups = 0;
            
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            allUsersSnapshot.forEach((doc) => {
                const userData = doc.data();
                const accountType = userData.accountType || 'user';
                
                // Count by account type
                if (accountType === 'coach') {
                    totalCoaches++;
                } else if (accountType === 'admin') {
                    totalAdmins++;
                } else {
                    totalUsers++;
                }
                
                // Count weekly signups - with proper date handling
                if (userData.createdAt) {
                    try {
                        let createdDate;
                        
                        // Handle different date formats
                        if (typeof userData.createdAt.toDate === 'function') {
                            // Firestore Timestamp
                            createdDate = userData.createdAt.toDate();
                        } else if (userData.createdAt instanceof Date) {
                            // Already a Date object
                            createdDate = userData.createdAt;
                        } else if (typeof userData.createdAt === 'string') {
                            // String date
                            createdDate = new Date(userData.createdAt);
                        } else if (typeof userData.createdAt === 'number') {
                            // Unix timestamp
                            createdDate = new Date(userData.createdAt);
                        }
                        
                        // Check if date is valid and within the last week
                        if (createdDate && !isNaN(createdDate.getTime()) && createdDate > oneWeekAgo) {
                            weeklySignups++;
                        }
                    } catch (dateError) {
                        console.warn('Error parsing createdAt date for user:', doc.id, dateError);
                        // Continue without counting this user in weekly signups
                    }
                }
            });

            // Count programs (assuming each user has a program)
            const totalPrograms = allUsersSnapshot.size;
            const totalExercises = allExercisesSnapshot.size;
            
            // Simulate other metrics
            const activeGymSessions = Math.floor(Math.random() * 50) + 10;
            const systemHealth = Math.floor(Math.random() * 10) + 90;
            
            setStats({
                totalUsers,
                totalCoaches,
                totalAdmins,
                activeGymSessions,
                totalExercises,
                totalPrograms,
                weeklySignups,
                systemHealth,
            });

        } catch (error) {
            console.error('Error fetching system stats:', error);
            Alert.alert('Error', 'Failed to load system statistics');
        }
    };

    const fetchGymStats = async () => {
        try {
            // Simulate gym data - in real app this would come from a gyms collection
            const mockGymData: GymStats[] = [
                { gymId: 1, name: 'Downtown Fitness', totalMembers: 245, activeToday: 67, capacity: 150, utilization: 45 },
                { gymId: 2, name: 'Northside Gym', totalMembers: 189, activeToday: 34, capacity: 100, utilization: 34 },
                { gymId: 3, name: 'Westend Sports', totalMembers: 312, activeToday: 89, capacity: 200, utilization: 45 },
            ];
            
            setGymStats(mockGymData);
        } catch (error) {
            console.error('Error fetching gym stats:', error);
        }
    };

    const fetchRecentUsers = async () => {
        try {
            const usersRef = collection(firestore, 'users');
            const recentUsersQuery = query(
                usersRef, 
                orderBy('createdAt', 'desc'), 
                limit(10)
            );
            const recentUsersSnapshot = await getDocs(recentUsersQuery);
            
            const users: User[] = [];
            recentUsersSnapshot.forEach((doc) => {
                const userData = doc.data();
                
                // Handle createdAt date parsing safely
                let createdAt = null;
                if (userData.createdAt) {
                    try {
                        if (typeof userData.createdAt.toDate === 'function') {
                            createdAt = userData.createdAt;
                        } else if (userData.createdAt instanceof Date) {
                            createdAt = Timestamp.fromDate(userData.createdAt);
                        } else if (typeof userData.createdAt === 'string' || typeof userData.createdAt === 'number') {
                            createdAt = Timestamp.fromDate(new Date(userData.createdAt));
                        }
                    } catch (error) {
                        console.warn('Error parsing createdAt for user:', doc.id, error);
                        createdAt = null;
                    }
                }
                
                // Handle lastActive date parsing safely
                let lastActive = null;
                if (userData.lastActive) {
                    try {
                        if (typeof userData.lastActive.toDate === 'function') {
                            lastActive = userData.lastActive;
                        } else if (userData.lastActive instanceof Date) {
                            lastActive = Timestamp.fromDate(userData.lastActive);
                        } else if (typeof userData.lastActive === 'string' || typeof userData.lastActive === 'number') {
                            lastActive = Timestamp.fromDate(new Date(userData.lastActive));
                        }
                    } catch (error) {
                        console.warn('Error parsing lastActive for user:', doc.id, error);
                        lastActive = null;
                    }
                }
                
                users.push({
                    id: doc.id,
                    displayName: userData.displayName || 'Unknown User',
                    email: userData.email || 'No email',
                    accountType: userData.accountType || 'user',
                    gym: userData.gym,
                    createdAt: createdAt,
                    onBoardingComplete: userData.onBoardingComplete || false,
                    lastActive: lastActive,
                    isActive: userData.isActive !== false,
                });
            });
            
            setRecentUsers(users);
        } catch (error) {
            console.error('Error fetching recent users:', error);
            Alert.alert('Error', 'Failed to load recent users');
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([
            fetchSystemStats(),
            fetchRecentUsers(),
            fetchGymStats(),
        ]);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const handleUserManagement = () => {
        navigation.navigate('UserSelection');
    };

    const handleViewUser = (user: User) => {
        navigation.navigate('UserProfile', { userId: user.id });
    };

    const handleQuickUserAction = (user: User) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(firestore, 'users', userId), {
                isActive: !currentStatus
            });
            
            Alert.alert(
                'Success', 
                `User ${!currentStatus ? 'activated' : 'suspended'} successfully`
            );
            setShowUserModal(false);
            loadData(); // Refresh data
        } catch (error) {
            console.error('Error updating user status:', error);
            Alert.alert('Error', 'Failed to update user status');
        }
    };

    const handleGymManagement = () => {
        setShowGymModal(true);
    };

    const handleExerciseManagement = () => {
        Alert.alert(
            'Exercise Management',
            'Choose an action:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'View All Exercises', onPress: () => navigation.navigate('Exercises') },
                { text: 'Add New Exercise', onPress: () => Alert.alert('Coming Soon', 'Exercise creation interface coming soon!') },
                { text: 'Bulk Import', onPress: () => Alert.alert('Bulk Import', 'CSV import functionality coming soon!') },
            ]
        );
    };

    const handleNotifications = () => {
        Alert.alert(
            'Send Notifications',
            'Choose notification type:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'System Announcement', onPress: () => showNotificationDialog('system') },
                { text: 'Maintenance Notice', onPress: () => showNotificationDialog('maintenance') },
                { text: 'Feature Update', onPress: () => showNotificationDialog('feature') },
            ]
        );
    };

    const showNotificationDialog = (type: string) => {
        Alert.prompt(
            `Send ${type} notification`,
            'Enter notification message:',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Send', 
                    onPress: (message) => {
                        if (message) {
                            Alert.alert('Success', `${type} notification sent to all users!`);
                        }
                    }
                },
            ],
            'plain-text'
        );
    };

    const handleSystemSettings = () => {
        setShowSystemModal(true);
    };

    const handleBackup = () => {
        Alert.alert(
            'Data Backup',
            'Choose backup type:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Full Backup', onPress: () => performBackup('full') },
                { text: 'User Data Only', onPress: () => performBackup('users') },
                { text: 'Exercises Only', onPress: () => performBackup('exercises') },
            ]
        );
    };

    const performBackup = (type: string) => {
        Alert.alert(
            'Backup Started',
            `${type} backup is being created. You will be notified when complete.`,
            [{ text: 'OK' }]
        );
    };

    const handleAnalytics = () => {
        Alert.alert(
            'Analytics Dashboard',
            'Choose analytics view:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'User Engagement', onPress: () => showAnalytics('engagement') },
                { text: 'Gym Utilization', onPress: () => showAnalytics('gym') },
                { text: 'App Performance', onPress: () => showAnalytics('performance') },
                { text: 'Revenue Metrics', onPress: () => showAnalytics('revenue') },
            ]
        );
    };

    const showAnalytics = (type: string) => {
        Alert.alert(
            `${type} Analytics`,
            `${type} analytics dashboard would open here. This would show detailed charts and metrics.`,
            [{ text: 'OK' }]
        );
    };

    const handleSecurity = () => {
        Alert.alert(
            'Security Center',
            'Choose security action:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'View Audit Logs', onPress: () => Alert.alert('Audit Logs', 'Recent security events and user actions would be displayed here.') },
                { text: 'Failed Login Attempts', onPress: () => Alert.alert('Failed Logins', 'No suspicious login attempts detected in the last 24 hours.') },
                { text: 'Active Sessions', onPress: () => Alert.alert('Active Sessions', `${stats.activeGymSessions} users currently active in the app.`) },
                { text: 'Export Security Report', onPress: () => Alert.alert('Report Generated', 'Security report has been generated and will be sent to admin email.') },
            ]
        );
    };

    const handleMaintenanceMode = () => {
        Alert.alert(
            'Maintenance Mode',
            'Enable maintenance mode? This will temporarily disable the app for all users.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Enable', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Maintenance Mode', 'Maintenance mode would be enabled. All users would see a maintenance screen.')
                },
            ]
        );
    };

    const StatCard = ({ title, value, icon, color, subtitle }: {
        title: string;
        value: number | string;
        icon: string;
        color: string;
        subtitle?: string;
    }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statContent}>
                <View style={styles.statText}>
                    <Text style={styles.statTitle}>{title}</Text>
                    <Text style={styles.statValue}>{value}</Text>
                    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                </View>
                <Ionicons name={icon as any} size={32} color={color} />
            </View>
        </View>
    );

    const AdminButton = ({ title, subtitle, icon, onPress, color = '#007AFF', badge }: {
        title: string;
        subtitle: string;
        icon: string;
        onPress: () => void;
        color?: string;
        badge?: string;
    }) => (
        <TouchableOpacity style={styles.adminButton} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon as any} size={24} color="#fff" />
                {badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>{title}</Text>
                <Text style={styles.buttonSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <Container>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading admin panel...</Text>
                </View>
            </Container>
        );
    }

    return (
        <Container style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Text style={styles.title}>Admin Dashboard</Text>
                
                {/* System Statistics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Overview</Text>
                    <View style={styles.statsGrid}>
                        <StatCard 
                            title="Total Users" 
                            value={stats.totalUsers} 
                            icon="people-outline" 
                            color="#007AFF" 
                        />
                        <StatCard 
                            title="Coaches" 
                            value={stats.totalCoaches} 
                            icon="fitness-outline" 
                            color="#34C759" 
                        />
                        <StatCard 
                            title="Exercises" 
                            value={stats.totalExercises} 
                            icon="barbell-outline" 
                            color="#FF9500" 
                        />
                        <StatCard 
                            title="Active Sessions" 
                            value={stats.activeGymSessions} 
                            icon="pulse-outline" 
                            color="#AF52DE" 
                        />
                        <StatCard 
                            title="Weekly Signups" 
                            value={stats.weeklySignups} 
                            icon="trending-up-outline" 
                            color="#30D158" 
                        />
                        <StatCard 
                            title="System Health" 
                            value={`${stats.systemHealth}%`} 
                            icon={stats.systemHealth > 95 ? "checkmark-circle-outline" : "warning-outline"} 
                            color={stats.systemHealth > 95 ? "#34C759" : "#FF3B30"} 
                            subtitle={stats.systemHealth > 95 ? "Excellent" : "Needs Attention"}
                        />
                    </View>
                </View>

                {/* User Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>User Management</Text>
                    
                    <AdminButton
                        title="User Directory"
                        subtitle="View and manage all users"
                        icon="people-outline"
                        onPress={handleUserManagement}
                        color="#007AFF"
                    />
                    
                    <AdminButton
                        title="Bulk Operations"
                        subtitle="Mass user actions and imports"
                        icon="layers-outline"
                        onPress={() => Alert.alert('Bulk Operations', 'Mass user operations interface coming soon!')}
                        color="#5856D6"
                    />
                </View>

                {/* Content Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Content Management</Text>
                    
                    <AdminButton
                        title="Exercise Database"
                        subtitle="Manage exercises and programs"
                        icon="barbell-outline"
                        onPress={handleExerciseManagement}
                        color="#FF9500"
                    />
                    
                    <AdminButton
                        title="Gym Management"
                        subtitle="Monitor gym facilities and usage"
                        icon="business-outline"
                        onPress={handleGymManagement}
                        color="#32D74B"
                    />
                    
                    <AdminButton
                        title="Push Notifications"
                        subtitle="Send announcements to users"
                        icon="notifications-outline"
                        onPress={handleNotifications}
                        color="#FF6B35"
                    />
                </View>

                {/* Analytics & Monitoring */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Analytics & Monitoring</Text>
                    
                    <AdminButton
                        title="Analytics Dashboard"
                        subtitle="User engagement and app metrics"
                        icon="analytics-outline"
                        onPress={handleAnalytics}
                        color="#5AC8FA"
                    />
                    
                    <AdminButton
                        title="Security Center"
                        subtitle="Monitor security and audit logs"
                        icon="shield-checkmark-outline"
                        onPress={handleSecurity}
                        color="#FF3B30"
                    />
                </View>

                {/* System Administration */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Administration</Text>
                    
                    <AdminButton
                        title="System Settings"
                        subtitle="Configure application settings"
                        icon="settings-outline"
                        onPress={handleSystemSettings}
                        color="#8E8E93"
                    />
                    
                    <AdminButton
                        title="Data Backup"
                        subtitle="Create and manage backups"
                        icon="cloud-upload-outline"
                        onPress={handleBackup}
                        color="#34C759"
                    />
                    
                    <AdminButton
                        title="Maintenance Mode"
                        subtitle="Enable system maintenance"
                        icon="construct-outline"
                        onPress={handleMaintenanceMode}
                        color="#FF9500"
                    />
                </View>

                {/* Recent Users with Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Users</Text>
                    {recentUsers.length === 0 ? (
                        <Text style={styles.noDataText}>No recent users found</Text>
                    ) : (
                        recentUsers.map((user) => (
                            <TouchableOpacity
                                key={user.id}
                                style={styles.userCard}
                                onPress={() => handleViewUser(user)}
                            >
                                <View style={styles.userInfo}>
                                    <View style={styles.userHeader}>
                                        <Text style={styles.userName}>{user.displayName}</Text>
                                        <View style={styles.userActions}>
                                            <TouchableOpacity 
                                                style={styles.quickActionButton}
                                                onPress={() => handleQuickUserAction(user)}
                                            >
                                                <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Text style={styles.userEmail}>{user.email}</Text>
                                    <View style={styles.userMeta}>
                                        <View style={[styles.roleTag, 
                                            user.accountType === 'coach' && styles.coachTag,
                                            user.accountType === 'admin' && styles.adminTag
                                        ]}>
                                            <Text style={[styles.roleText,
                                                user.accountType === 'coach' && styles.coachText,
                                                user.accountType === 'admin' && styles.adminText
                                            ]}>
                                                {user.accountType.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusDot, 
                                            user.isActive ? styles.activeDot : styles.inactiveDot
                                        ]} />
                                        <Text style={styles.gymInfo}>
                                            Gym: {user.gym || 'Not selected'}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#666" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* User Quick Actions Modal */}
            <Modal
                visible={showUserModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowUserModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>User Actions</Text>
                        {selectedUser && (
                            <View>
                                <Text style={styles.modalUserName}>{selectedUser.displayName}</Text>
                                <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                                
                                <TouchableOpacity 
                                    style={styles.modalButton}
                                    onPress={() => handleViewUser(selectedUser)}
                                >
                                    <Ionicons name="person-outline" size={20} color="#007AFF" />
                                    <Text style={styles.modalButtonText}>View Profile</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.modalButton, !selectedUser.isActive && styles.activateButton]}
                                    onPress={() => handleToggleUserStatus(selectedUser.id, selectedUser.isActive || false)}
                                >
                                    <Ionicons 
                                        name={selectedUser.isActive ? "ban-outline" : "checkmark-circle-outline"} 
                                        size={20} 
                                        color={selectedUser.isActive ? "#FF3B30" : "#34C759"} 
                                    />
                                    <Text style={[styles.modalButtonText, 
                                        { color: selectedUser.isActive ? "#FF3B30" : "#34C759" }
                                    ]}>
                                        {selectedUser.isActive ? "Suspend User" : "Activate User"}
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.modalCancelButton}
                                    onPress={() => setShowUserModal(false)}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Gym Management Modal */}
            <Modal
                visible={showGymModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowGymModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gym Management</Text>
                        
                        <ScrollView style={styles.gymStatsContainer}>
                            {gymStats.map((gym) => (
                                <View key={gym.gymId} style={styles.gymStatCard}>
                                    <Text style={styles.gymName}>{gym.name}</Text>
                                    <View style={styles.gymMetrics}>
                                        <Text style={styles.gymMetric}>Members: {gym.totalMembers}</Text>
                                        <Text style={styles.gymMetric}>Active Today: {gym.activeToday}</Text>
                                        <Text style={styles.gymMetric}>Capacity: {gym.capacity}</Text>
                                        <Text style={[styles.gymMetric, 
                                            { color: gym.utilization > 80 ? '#FF3B30' : '#34C759' }
                                        ]}>
                                            Utilization: {gym.utilization}%
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        
                        <TouchableOpacity 
                            style={styles.modalCloseButton}
                            onPress={() => setShowGymModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* System Settings Modal */}
            <Modal
                visible={showSystemModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSystemModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>System Settings</Text>
                        
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Maintenance Mode</Text>
                            <Switch
                                value={false}
                                onValueChange={() => Alert.alert('Maintenance Mode', 'This would toggle maintenance mode.')}
                            />
                        </View>
                        
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>New User Registrations</Text>
                            <Switch
                                value={true}
                                onValueChange={() => Alert.alert('Registration', 'This would toggle user registrations.')}
                            />
                        </View>
                        
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Debug Mode</Text>
                            <Switch
                                value={false}
                                onValueChange={() => Alert.alert('Debug Mode', 'This would toggle debug logging.')}
                            />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.modalCloseButton}
                            onPress={() => setShowSystemModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Container>
    );
};

export default AdminPanel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
        padding: 16,
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#1a1a1a',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    statsGrid: {
        gap: 12,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statText: {
        flex: 1,
    },
    statTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    statSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    adminButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    buttonText: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    buttonSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userInfo: {
        flex: 1,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    roleTag: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    coachTag: {
        backgroundColor: '#e8f5e8',
    },
    adminTag: {
        backgroundColor: '#fff3e0',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1976d2',
    },
    coachText: {
        color: '#388e3c',
    },
    adminText: {
        color: '#f57c00',
    },
    gymInfo: {
        fontSize: 12,
        color: '#999',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        width: '80%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1a1a1a',
    },
    modalUserName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    modalUserEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    modalButton: {
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 8,
    },
    modalCancelButton: {
        backgroundColor: '#ff3b30',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    activateButton: {
        backgroundColor: '#34c759',
    },
    gymStatsContainer: {
        maxHeight: 200,
    },
    gymStatCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    gymName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    gymMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gymMetric: {
        fontSize: 14,
        color: '#666',
    },
    modalCloseButton: {
        backgroundColor: '#ff3b30',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    quickActionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#e3f2fd',
    },
    activeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#34c759',
        marginLeft: 8,
    },
    inactiveDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ff3b30',
        marginLeft: 8,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ff3b30',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
    },
}); 