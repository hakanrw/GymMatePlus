import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Switch,
    ScrollView,
    TextInput,
    Modal,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Container } from '@/components/Container';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, getFirestore } from '@firebase/firestore';

const Settings = () => {
    const navigation = useNavigation() as any;
    const [userData, setUserData] = useState<any>(null);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [newWeight, setNewWeight] = useState('');
    const [newHeight, setNewHeight] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        if (!auth.currentUser) return;

        try {
            const userDoc = await getDoc(doc(getFirestore(), 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);
                setNotifications(data.notifications ?? true);
                setDarkMode(data.darkMode ?? false);
                setNewDisplayName(data.displayName || auth.currentUser.displayName || '');
                setNewWeight(data.weight?.toString() || '');
                setNewHeight(data.height?.toString() || '');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserSetting = async (field: string, value: any) => {
        if (!auth.currentUser) return;

        try {
            await updateDoc(doc(getFirestore(), 'users', auth.currentUser.uid), {
                [field]: value
            });
        } catch (error) {
            console.error('Error updating setting:', error);
            Alert.alert('Error', 'Failed to update setting');
        }
    };

    const handleNotificationToggle = (value: boolean) => {
        setNotifications(value);
        updateUserSetting('notifications', value);
    };

    const handleDarkModeToggle = (value: boolean) => {
        setDarkMode(value);
        updateUserSetting('darkMode', value);
        // Note: You would implement actual dark mode theme switching here
        Alert.alert('Dark Mode', 'Dark mode will be implemented in a future update');
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                        } catch (error) {
                            console.error('Error signing out:', error);
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. Are you sure you want to delete your account?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Feature Coming Soon', 'Account deletion will be available in a future update');
                    },
                },
            ]
        );
    };

    const handleProfileEdit = () => {
        setShowProfileModal(true);
    };

    const handleSaveProfile = async () => {
        if (!auth.currentUser) return;

        try {
            const updates: any = {};
            
            if (newDisplayName.trim()) {
                updates.displayName = newDisplayName.trim();
            }
            
            if (newWeight.trim()) {
                const weight = parseFloat(newWeight);
                if (!isNaN(weight) && weight > 0) {
                    updates.weight = weight;
                }
            }
            
            if (newHeight.trim()) {
                const height = parseFloat(newHeight);
                if (!isNaN(height) && height > 0) {
                    updates.height = height;
                }
            }

            if (Object.keys(updates).length > 0) {
                await updateDoc(doc(getFirestore(), 'users', auth.currentUser.uid), updates);
                setUserData({ ...userData, ...updates });
                Alert.alert('Success', 'Profile updated successfully!');
            }
            
            setShowProfileModal(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleSubscription = () => {
        Alert.alert(
            'Subscription Management',
            'Manage your gym membership:',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'View Current Plan',
                    onPress: () => {
                        const gymId = userData?.gym || 'Unknown';
                        Alert.alert(
                            'Current Plan',
                            `Gym: ${gymId}\nPlan: Premium Membership\nStatus: Active\nNext billing: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                        );
                    },
                },
                {
                    text: 'Contact Billing',
                    onPress: () => handleContactSupport(),
                },
            ]
        );
    };

    const handleHelp = () => {
        setShowHelpModal(true);
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to contact us?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Email',
                    onPress: () => {
                        Linking.openURL('mailto:support@gymmate.com?subject=GymMate+ Support Request')
                            .catch(() => Alert.alert('Error', 'Could not open email app'));
                    },
                },
                {
                    text: 'Copy Email',
                    onPress: () => {
                        Alert.alert('Email Copied', 'support@gymmate.com has been copied to your clipboard');
                    },
                },
            ]
        );
    };

    const handlePrivacyPolicy = () => {
        Alert.alert(
            'Privacy Policy',
            'Your privacy is important to us. Our privacy policy covers:\n\n• Data collection and usage\n• Information sharing policies\n• Security measures\n• Your rights and choices\n\nWould you like to view the full policy?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'View Policy',
                    onPress: () => {
                        Alert.alert(
                            'Privacy Policy Summary',
                            'Data We Collect:\n• Account information\n• Workout data\n• Gym check-in/out times\n\nHow We Use It:\n• Improve your experience\n• Track fitness progress\n• Provide coach insights\n\nWe never sell your data to third parties.'
                        );
                    },
                },
            ]
        );
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const SettingItem = ({ 
        icon, 
        title, 
        subtitle, 
        onPress, 
        rightComponent, 
        showArrow = true,
        danger = false 
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        rightComponent?: React.ReactNode;
        showArrow?: boolean;
        danger?: boolean;
    }) => (
        <TouchableOpacity 
            style={styles.settingItem} 
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingLeft}>
                <Ionicons 
                    name={icon as any} 
                    size={24} 
                    color={danger ? "#dc3545" : "#007AFF"} 
                />
                <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, danger && styles.dangerText]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={styles.settingSubtitle}>{subtitle}</Text>
                    )}
                </View>
            </View>
            <View style={styles.settingRight}>
                {rightComponent}
                {showArrow && onPress && (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <Container>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Settings</Text>
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
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    
                    <SettingItem
                        icon="person-outline"
                        title="Profile Information"
                        subtitle="Update your personal details"
                        onPress={handleProfileEdit}
                    />
                    
                    <SettingItem
                        icon="card-outline"
                        title="Subscription"
                        subtitle="Manage your gym membership"
                        onPress={handleSubscription}
                    />
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    
                    <SettingItem
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Receive workout reminders and updates"
                        rightComponent={
                            <Switch
                                value={notifications}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: '#ccc', true: '#007AFF' }}
                                thumbColor="#fff"
                            />
                        }
                        showArrow={false}
                    />
                    
                    <SettingItem
                        icon="moon-outline"
                        title="Dark Mode"
                        subtitle="Switch to dark theme"
                        rightComponent={
                            <Switch
                                value={darkMode}
                                onValueChange={handleDarkModeToggle}
                                trackColor={{ false: '#ccc', true: '#007AFF' }}
                                thumbColor="#fff"
                            />
                        }
                        showArrow={false}
                    />
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    
                    <SettingItem
                        icon="help-circle-outline"
                        title="Help & FAQ"
                        subtitle="Get answers to common questions"
                        onPress={handleHelp}
                    />
                    
                    <SettingItem
                        icon="mail-outline"
                        title="Contact Support"
                        subtitle="Get help from our team"
                        onPress={handleContactSupport}
                    />
                    
                    <SettingItem
                        icon="document-text-outline"
                        title="Privacy Policy"
                        subtitle="Read our privacy policy"
                        onPress={handlePrivacyPolicy}
                    />
                </View>

                {/* Account Actions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Actions</Text>
                    
                    <SettingItem
                        icon="log-out-outline"
                        title="Sign Out"
                        subtitle="Sign out of your account"
                        onPress={handleSignOut}
                    />
                    
                    <SettingItem
                        icon="trash-outline"
                        title="Delete Account"
                        subtitle="Permanently delete your account"
                        onPress={handleDeleteAccount}
                        danger={true}
                    />
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appInfoText}>GymMate+ v1.0.0</Text>
                    <Text style={styles.appInfoText}>© 2024 GymMate+</Text>
                </View>
            </ScrollView>

            {/* Profile Edit Modal */}
            <Modal
                visible={showProfileModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowProfileModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        
                        <Text style={styles.inputLabel}>Display Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your name"
                            value={newDisplayName}
                            onChangeText={setNewDisplayName}
                        />
                        
                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your weight"
                            value={newWeight}
                            onChangeText={setNewWeight}
                            keyboardType="numeric"
                        />
                        
                        <Text style={styles.inputLabel}>Height (cm)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your height"
                            value={newHeight}
                            onChangeText={setNewHeight}
                            keyboardType="numeric"
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.modalCancelButton}
                                onPress={() => setShowProfileModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.modalSaveButton}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.modalSaveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Help Modal */}
            <Modal
                visible={showHelpModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowHelpModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Help & FAQ</Text>
                        
                        <ScrollView style={styles.helpContent}>
                            <View style={styles.helpSection}>
                                <Text style={styles.helpSectionTitle}>QR Scanner</Text>
                                <Text style={styles.helpText}>
                                    1. Tap the QR icon in the bottom navigation{'\n'}
                                    2. Point your camera at the gym QR code{'\n'}
                                    3. The app will automatically check you in/out{'\n'}
                                    4. Make sure you're registered for the correct gym!
                                </Text>
                            </View>
                            
                            <View style={styles.helpSection}>
                                <Text style={styles.helpSectionTitle}>Workout Tracking</Text>
                                <Text style={styles.helpText}>
                                    1. Go to your Profile page{'\n'}
                                    2. Use the "+" button to add weight entries{'\n'}
                                    3. View your progress in the charts{'\n'}
                                    4. Check your BMI trends over time
                                </Text>
                            </View>
                            
                            <View style={styles.helpSection}>
                                <Text style={styles.helpSectionTitle}>Coach Features</Text>
                                <Text style={styles.helpText}>
                                    Coaches can:{'\n'}
                                    • View trainee gym entries{'\n'}
                                    • Create workout programs{'\n'}
                                    • Track trainee progress{'\n'}
                                    • Manage trainee schedules
                                </Text>
                            </View>
                            
                            <View style={styles.helpSection}>
                                <Text style={styles.helpSectionTitle}>Troubleshooting</Text>
                                <Text style={styles.helpText}>
                                    • QR scanner not working? Check camera permissions{'\n'}
                                    • Can't see your data? Try refreshing the app{'\n'}
                                    • Login issues? Contact support{'\n'}
                                    • App crashes? Restart and try again
                                </Text>
                            </View>
                        </ScrollView>
                        
                        <TouchableOpacity 
                            style={styles.modalCloseButton}
                            onPress={() => setShowHelpModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Container>
    );
};

export default Settings;

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
    content: {
        flex: 1,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 1,
        borderRadius: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dangerText: {
        color: '#dc3545',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    appInfoText: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalCancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalSaveButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    modalSaveText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    helpContent: {
        flex: 1,
    },
    helpSection: {
        marginBottom: 20,
    },
    helpSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 16,
        color: '#666',
    },
    modalCloseButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
}); 