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

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const SCAN_AREA_SIZE = 250;

const QR = () => {
    const navigation = useNavigation() as any;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);

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
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </Container>
        );
    }

    const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
        setScanned(true);
        try {
            // Here you can handle the scanned QR code data
            // For now, we'll just show an alert
            Alert.alert(
                "QR Code Detected",
                `${data}`,
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => setScanned(false)
                    },
                    {
                        text: "OK",
                        onPress: () => {
                            // Handle the QR code data here
                            setScanned(false);
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Invalid QR Code");
            setScanned(false);
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
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
});
