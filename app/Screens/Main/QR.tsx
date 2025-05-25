import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '@/components/Container';
import { doc, getDoc, collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc, getFirestore } from '@firebase/firestore';
import { auth } from '../../firebaseConfig';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const SCAN_AREA_SIZE = 250;

const QR = () => {
    const navigation = useNavigation() as any;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    useEffect(() => {
        requestPermission();
    }, []);

    if (!permission) {
        return (
            <Container style={styles.container}>
                <Text style={styles.text}>Requesting camera permission...</Text>
            </Container>
        );
    }

    if (!permission.granted) {
        return (
            <Container style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </Container>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
        if (processing || cooldown) return; // Prevent multiple scans during processing or cooldown
        
        setScanned(true);
        setProcessing(true);
        setCooldown(true);
        
        try {
            if (!auth.currentUser) {
                Alert.alert("Error", "You must be logged in to use gym check-in", [
                    {
                        text: "OK",
                        onPress: () => {
                            setScanned(false);
                            setProcessing(false);
                            // Reset cooldown after 2 seconds for error cases
                            setTimeout(() => setCooldown(false), 2000);
                        }
                    }
                ]);
                return;
            }

            // Get current user data to check their gym
            const userDoc = await getDoc(doc(getFirestore(), 'users', auth.currentUser.uid));
            if (!userDoc.exists()) {
                Alert.alert("Error", "User data not found", [
                    {
                        text: "OK",
                        onPress: () => {
                            setScanned(false);
                            setProcessing(false);
                            setTimeout(() => setCooldown(false), 2000);
                        }
                    }
                ]);
                return;
            }

            const userData = userDoc.data();
            const userGym = userData.gym;

            // Parse the QR code data (expecting gym ID)
            const scannedGymId = parseInt(data);
            
            if (isNaN(scannedGymId)) {
                Alert.alert("Error", "Invalid QR Code - not a valid gym ID", [
                    {
                        text: "OK",
                        onPress: () => {
                            setScanned(false);
                            setProcessing(false);
                            setTimeout(() => setCooldown(false), 2000);
                        }
                    }
                ]);
                return;
            }

            // Check if the scanned gym matches user's gym
            if (userGym !== scannedGymId) {
                Alert.alert(
                    "Access Denied", 
                    `This QR code is for gym ${scannedGymId}, but you're registered for gym ${userGym || 'none'}`,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                setScanned(false);
                                setProcessing(false);
                                setTimeout(() => setCooldown(false), 2000);
                            }
                        }
                    ]
                );
                return;
            }

            // Check if user has an active gym session
            const gymentriesRef = collection(getFirestore(), 'gymentries');
            const activeSessionQuery = query(
                gymentriesRef,
                where('userId', '==', auth.currentUser.uid),
                where('exitTime', '==', null)
            );

            const activeSessionSnapshot = await getDocs(activeSessionQuery);
            const hasActiveSession = !activeSessionSnapshot.empty;

            if (hasActiveSession) {
                // User is checking out
                const sessionDoc = activeSessionSnapshot.docs[0];
                const sessionData = sessionDoc.data();
                const entryTime = sessionData.entryTime.toDate();
                const exitTime = new Date();
                const duration = Math.round((exitTime.getTime() - entryTime.getTime()) / (1000 * 60)); // duration in minutes

                // Update the session with exit time
                await updateDoc(doc(getFirestore(), 'gymentries', sessionDoc.id), {
                    exitTime: exitTime,
                    duration: duration
                });

                // Reset states immediately after successful operation
                setScanned(false);
                setProcessing(false);
                
                // Set cooldown for 3 seconds after successful operation
                setTimeout(() => setCooldown(false), 3000);

                Alert.alert(
                    "Gym Check-Out",
                    `Thanks for your workout!\n\nSession Duration: ${duration} minutes\nEntry: ${entryTime.toLocaleTimeString()}\nExit: ${exitTime.toLocaleTimeString()}`
                );
            } else {
                // User is checking in
                const entryTime = new Date();
                
                // Create new gym entry
                await addDoc(gymentriesRef, {
                    userId: auth.currentUser.uid,
                    gymId: scannedGymId,
                    entryTime: entryTime,
                    exitTime: null,
                    duration: null,
                    createdAt: entryTime
                });

                // Reset states immediately after successful operation
                setScanned(false);
                setProcessing(false);
                
                // Set cooldown for 3 seconds after successful operation
                setTimeout(() => setCooldown(false), 3000);

                Alert.alert(
                    "Gym Check-In",
                    `Welcome to the gym!\n\nEntry Time: ${entryTime.toLocaleTimeString()}\nEnjoy your workout!`
                );
            }

        } catch (error) {
            console.error('Error handling gym check-in/out:', error);
            
            // Reset states immediately on error
            setScanned(false);
            setProcessing(false);
            setTimeout(() => setCooldown(false), 2000);
            
            Alert.alert("Error", "Failed to process gym entry. Please try again.");
        }
    };

    const toggleFlash = () => {
        setTorch(!torch);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned || cooldown ? undefined : handleBarCodeScanned}
                enableTorch={torch}
            >
                <View style={styles.overlay}>
                    <View style={styles.unfocusedContainer}></View>
                    <View style={styles.middleContainer}>
                        <View style={styles.unfocusedContainer}></View>
                        <View style={styles.focusedContainer}>
                            {/* Scanner frame */}
                            <View style={[styles.cornerBorder, styles.topLeft]} />
                            <View style={[styles.cornerBorder, styles.topRight]} />
                            <View style={[styles.cornerBorder, styles.bottomLeft]} />
                            <View style={[styles.cornerBorder, styles.bottomRight]} />
                        </View>
                        <View style={styles.unfocusedContainer}></View>
                    </View>
                    <View style={styles.unfocusedContainer}></View>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={toggleFlash}
                    >
                        <Ionicons 
                            name={torch ? "flash" : "flash-off"} 
                            size={24} 
                            color="#fff" 
                        />
                    </TouchableOpacity>
                </View>
                
                {/* Processing Indicator */}
                {processing && (
                    <View style={styles.processingOverlay}>
                        <View style={styles.processingContainer}>
                            <Text style={styles.processingText}>Processing...</Text>
                        </View>
                    </View>
                )}
            </CameraView>
        </View>
    );
};

export default QR;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    overlay: {
        flex: 1,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: SCAN_AREA_SIZE,
    },
    focusedContainer: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
    },
    cornerBorder: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderLeftWidth: 3,
        borderTopWidth: 3,
    },
    topRight: {
        top: 0,
        right: 0,
        borderRightWidth: 3,
        borderTopWidth: 3,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderRightWidth: 3,
        borderBottomWidth: 3,
    },
    controls: {
        position: 'absolute',
        top: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    button: {
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    processingText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
