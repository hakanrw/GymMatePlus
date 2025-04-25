import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation} from "@react-navigation/native";
import { MainButton } from '@/components/MainButton';
import { FontAwesome } from '@expo/vector-icons';
import { Container } from '@/components/Container';

const gyms = [
    {
        id: 1,
        name: "Yeditepe Fitness Center .NET",
        address: "İnönü Mahallesi\nKayışdağı/Ataşehir\n34755",
        image: null,
        price: 999,
    },
    {
        id: 2,
        name: "Kayışdağı Fitness",
        address: "Atatürk Mahallesi\nAtaşehir/İstanbul\n34758",
        image: null,
        price: 799,
    },
    {
        id: 3,
        name: "Fitness+ Ultra Club",
        address: "Barbaros Mahallesi\nÜsküdar/İstanbul\n34662",
        image: null,
        price: 699,
    }
];

const GymSelection = () => {
    const [selectedGym, setSelectedGym] = useState(gyms[0]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSelect = (gym: any) => {
        setSelectedGym(gym);
        setDropdownOpen(false);

    };
    const navigation = useNavigation() as any;


    return (
        <Container>
            <Text style={styles.header}>Gym Selection</Text>

            {/* Dropdown Header */}
            <View style={{ width: '100%' }}>
                <View style={styles.dropdownWrapper}>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <Text style={styles.dropdownButtonText}>{selectedGym.name}</Text>
                        <FontAwesome name="chevron-down" size={12} color="#aaa" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                </View>
            </View>

            {/* Dropdown List */}
            {dropdownOpen && (
                <View style={styles.dropdownList}>
                    {gyms.map((gym) => (
                        <TouchableOpacity
                            key={gym.id}
                            style={styles.dropdownItem}
                            onPress={() => handleSelect(gym)}
                        >
                            <Text style={styles.dropdownItemText}>{gym.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            
            {/* Gym Info */}
            <View style={[styles.card, {flexDirection: 'row', alignItems: 'center', marginTop: 30}]}>
                <Image style={styles.image} source={require('../../assets/images/map.png')} />
                <Text style={styles.address}>{selectedGym.address}</Text>
            </View>

            {/* Pricing Card */}
            <View style={[styles.card, {paddingVertical: 20}]}>
                <Text style={styles.planTitle}>Basic</Text>
                <Text style={styles.price}>
                    ₺{selectedGym.price} <Text style={styles.perMonth}>/ mo</Text>
                </Text>

                <View style={styles.featuresList}>
                    <Text style={styles.featureItem}>• Full access to equipment</Text>
                    <Text style={styles.featureItem}>• Flexible hours</Text>
                    <Text style={styles.featureItem}>• 24/7 customer support</Text>
                </View>
            </View>

            {/* Padding */}
            <View style={{flex: 1}}/>

            {/* Continue Button */}
            <MainButton 
                onPress={() => navigation.navigate('Payment', { gym: selectedGym })}
                text="Continue to Payment"/>
        </Container>
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
    },
    dropdownWrapper: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
        width: '100%',
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    dropdownButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        flex: 1,
    },
    arrowIcon: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
    },
    dropdownList: {
        position: 'absolute',
        top: 125,
        zIndex: 100,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
        width: '100%',
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    gymInfoContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    image: {
        height: 120,
        width: 120,
    },
    address: {
        fontSize: 20,
        textAlign: 'center',
        flex: 1,
        color: '#333',
    },
    card: {
        borderRadius: 10,
        borderColor: '#ccc',
        margin: 20,
        borderWidth: 1,
        width: '100%',
        alignSelf: 'center',

    },
    planTitle: {
        alignSelf: 'center',
        fontSize: 30,
        fontWeight: '700',
        marginBottom: 8,
    },
    price: {
        alignSelf: 'center',
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    perMonth: {
        fontSize: 16,
        fontWeight: '400',
    },
    featuresList: {
        marginTop: 8,
    },
    featureItem: {
        width: 300,
        alignSelf: 'center',
        fontSize: 17,
        marginBottom: 4,
    },
    submitButton: {
        backgroundColor: '#000',
        width: 400,
        alignSelf: 'center',
        borderRadius: 10,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default GymSelection;
