import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MainButton } from '@/components/MainButton';

const ProfileScreen = () => {
    const [selectedGoals, setSelectedGoals] = useState<string[]>(['Lose Weight']);
    const [selectedAreas, setSelectedAreas] = useState<string[]>(['Chest', 'Biceps', 'Glutes']);
    const [selectedSex, setSelectedSex] = useState<string>('Female');
    const [email, setEmail] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    const toggleGoal = (goal: string) => {
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(selectedGoals.filter(g => g !== goal));
        } else {
            setSelectedGoals([...selectedGoals, goal]);
        }
    };

    const toggleArea = (area: string) => {
        if (selectedAreas.includes(area)) {
            setSelectedAreas(selectedAreas.filter(a => a !== area));
        } else {
            setSelectedAreas([...selectedAreas, area]);
        }
    };
    const navigation = useNavigation() as any;
    const handleContinue = () => {
        navigation.navigate('WelcomeScreen');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    <Text style={styles.title}>Profile Setup</Text>

                    {/* Email */}
                    <View style={styles.row}>
                        <Text style={styles.label}>E-MAIL</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            placeholderTextColor="#aaa"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Weight + Height */}
                    <View style={[styles.row, { justifyContent: 'space-between' }]}>
                        <View style={styles.inlineGroup}>
                            <Text style={styles.label}>WEIGHT</Text>
                            <TextInput
                                style={styles.input}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder="74"
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        <View style={styles.inlineGroup}>
                            <Text style={styles.label}>HEIGHT</Text>
                            <TextInput
                                style={styles.input}
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                                placeholder="170"
                                placeholderTextColor="#aaa"
                            />
                        </View>
                    </View>

                    {/* Sex */}
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>SEX</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>Female</Text>
                            <FontAwesome name="chevron-down" size={12} color="#aaa" style={{ marginLeft: 6 }} />
                        </View>
                    </TouchableOpacity>

                    {/* Birth Date */}
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>DOB</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>21 May 1999</Text>
                            <FontAwesome name="chevron-down" size={12} color="#aaa" style={{ marginLeft: 6 }} />
                        </View>
                    </TouchableOpacity>

                    {/* Fitness Goals */}
                    <View style={[styles.section, { borderTopWidth: 0, marginTop: 10 }]}>
                        <Text style={styles.sectionTitle}>Fitness Goals</Text>

                        {[
                            ['Lose Weight', 'Build Muscle'],
                            ['Improve Endurance', 'Flexibility/Mobility'],
                            ['General Fitness/Health'],
                        ].map((row, i) => (
                            <View key={i} style={styles.chipRow}>
                                {row.map(goal => (
                                    <TouchableOpacity
                                        key={goal}
                                        onPress={() => toggleGoal(goal)}
                                        style={[
                                            styles.chip,
                                            selectedGoals.includes(goal) && styles.chipSelected,
                                        ]}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            selectedGoals.includes(goal) && styles.chipTextSelected
                                        ]}>
                                            {goal}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Workout Areas */}
                    <View style={[styles.section, {paddingBottom: 10}]}>
                        <Text style={styles.sectionTitle}>Select Areas You Want to Work Out</Text>

                        {[
                            ['Chest', 'Back', 'Shoulders'],
                            ['Triceps', 'Biceps', 'Quads'],
                            ['Hamstrings', 'Glutes', 'Calves'],
                            ['Abs', 'Obliques', 'Cardio'],
                        ].map((row, i) => (
                            <View key={i} style={styles.chipRow}>
                                {row.map(area => (
                                    <TouchableOpacity
                                        key={area}
                                        onPress={() => toggleArea(area)}
                                        style={[
                                            styles.chip,
                                            selectedAreas.includes(area) && styles.chipSelected
                                        ]}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            selectedAreas.includes(area) && styles.chipTextSelected
                                        ]}>
                                            {area}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Submit Button */}
                    <MainButton 
                        onPress={() => {
                            console.log('Profile Created');
                            handleContinue();
                        }}
                        text={"Create Profile"}/>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    label: {
        minWidth: 60,
        marginRight: 20,
        fontSize: 13,
        fontWeight: 'bold',
        left: 10,
        textTransform: 'uppercase',
        color: '#000',
    },
    value: {
        fontSize: 16,
        color: '#888',
        textAlign: 'left',
        flex: 1
    },
    rowRight: {
        flexDirection: 'row',
        paddingRight: 10,
        alignItems: 'center',
        flex: 1
    },
    inlineGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        justifyContent: 'space-between',
    },
    section: {
        paddingTop: 10,
    },
    sectionTitle: {
        fontSize: 21,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'left',
        paddingLeft: 13,
    },
    chipRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 6,
        marginVertical: 6,
        alignItems: 'center',
    },
    chipSelected: {
        backgroundColor: '#000',
    },
    chipText: {
        fontSize: 14,
        color: '#000',
    },
    chipTextSelected: {
        color: '#fff',
    },
    submitButton: {
        backgroundColor: '#000',
        marginTop: 10,
        width: 400,
        alignSelf: 'center',
        marginBottom: 30,
        borderRadius: 10,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        paddingLeft: 0,
        marginVertical: -5,
        fontSize: 16,
        color: '#000',
        textAlign: 'left',
        flex: 1,
    },
});
