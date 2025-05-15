import React, { useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainButton } from '@/components/MainButton';
import { Container } from '@/components/Container';
import { httpsCallable } from '@firebase/functions';
import { functions } from '../firebaseConfig';
import { AppContext } from '@/contexts/PingContext';

const Payment = () => {
    const route = useRoute();
    const gym = (route.params as any)?.gym ?? { name: 'Unknown Gym', price: 0 };
    const navigation = useNavigation() as any;

    const submitPayment = () => {
        const selectGymAndPayment = httpsCallable(functions, 'selectGymAndPayment');
        selectGymAndPayment({
            gym: 1,
            paymentInfo: "AAAA-AAAA-AAAA-AAAA"
        }).then((value) => {
            console.log(value);
            navigation.navigate("PaymentSuccess");
        }).catch((error) => {
            console.error(error);
        });
    };

    return (
        <Container>
            <Text style={styles.header}>Gym Payment</Text>

            <View style={styles.gymInfo}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/images/fitness.png")}
                        style={styles.logo}
                    />
                </View>
                <Text style={styles.gymName}>{gym?.name}</Text>
            </View>


            <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                    <Text style={styles.planText}>Basic</Text>
                    <Text style={styles.priceText}>{gym?.price}₺</Text>
                </View>
            </View>


            <View style={styles.paymentForm}>
                <View style={[styles.row, {padding: 20, paddingBottom: 0}]}>
                    <Image        
                        style={styles.cardIcon}
                        source={require('../../assets/images/mc.png')}
                        resizeMode="contain"
                    />
                    <View style={{flex: 1}}>
                        <View style={styles.cardInputContainer}>
                            <TextInput
                                style={styles.cardInput}
                                placeholder="5444 xxxx xxxx xxxx"
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.expiryInput]}
                                placeholder="MM/YY"
                                placeholderTextColor="#999"
                            />
                            <TextInput
                                style={[styles.input, styles.cvvInput]}
                                placeholder="CCV"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.cardStripe}/>
            </View>

            {/* Padding */}
            <View style={{flex: 1}}/>

            {/* Submit Button */}
            <MainButton onPress={submitPayment} text="Start Subscription"
            />
        </Container>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
    },
    gymInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
    },
    logo: {
        width: '100%',
        height: '100%'
    },
    gymName: {
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 16,
    },
    priceCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 24,
        marginBottom: 24,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planText: {
        fontSize: 24,
        fontWeight: '600',
    },
    priceText: {
        fontSize: 24,
        fontWeight: '600',
    },
    paymentForm: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 24,
    },
    cardInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardIcon: {
        width: 60,
        height: 60,
    },
    cardInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    cardStripe: {
        marginVertical: 20,
        height: 40,
        opacity: 0.2,
        backgroundColor: '#000000'
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    expiryInput: {
        flex: 1,
    },
    cvvInput: {
        width: 96,
    }
});

export default Payment;
