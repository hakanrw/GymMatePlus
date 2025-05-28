import React, { useContext, useEffect, useState } from 'react';
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
import { Container } from '@/components/Container';
import { httpsCallable } from '@firebase/functions';
import { AppContext } from '@/contexts/PingContext';
import { auth, functions } from '../../firebaseConfig';
import { InformationBubble } from '@/components/InformationBubble';

const ProfileScreen = () => {
    const { ping } = useContext(AppContext);
    const [selectedGoals, setSelectedGoals] = useState<string[]>(['Lose Weight']);
    const [difficulty, setDifficulty] = useState<string>('Medium');
    const [selectedSex, setSelectedSex] = useState<string>('Female');
    const [email, setEmail] = useState(auth.currentUser?.email as string);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [showSexDropdown, setShowSexDropdown] = useState(false);
    const [showDobDropdown, setShowDobDropdown] = useState(false);
    const [selectedDay, setSelectedDay] = useState('21');
    const [selectedMonth, setSelectedMonth] = useState('May');
    const [selectedYear, setSelectedYear] = useState('1999');
    const [status, setStatus] = useState<{status: string, message: string} | null>(null);

    // Generate arrays for date selection
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 80 }, (_, i) => (currentYear - 15 - i).toString());

    const formatDateOfBirth = () => {
        return `${selectedDay} ${selectedMonth} ${selectedYear}`;
    };

    const toggleGoal = (goal: string) => {
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(selectedGoals.filter(g => g !== goal));
        } else {
            setSelectedGoals([...selectedGoals, goal]);
        }
    };

    const submitProfile = () => {
        setStatus({ status: "info", message: "Creating profile..."});

        const submitUserProfile = httpsCallable(functions, 'submitUserProfile');
        submitUserProfile({
            weight: Number.parseInt(weight),
            height: Number.parseInt(height),
            sex: selectedSex,
            dateOfBirth: formatDateOfBirth(),
            fitnessGoals: selectedGoals,
            difficulty
        }).then((value) => {
            setStatus({ status: "success", message: "Success!"});
            console.log(value);
            ping();
        }).catch((error) => {
            console.error(error);
            setStatus({ status: "error", message: error.message});
        });
    };

    return (
        <Container>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{flex: 1}}>
                    <Text style={styles.title}>Profile Setup</Text>

                    {/* Email */}
                    <View style={styles.row}>
                        <Text style={styles.label}>E-MAIL</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            placeholder="your@email.com"
                            placeholderTextColor="#aaa"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={false}
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
                    <View>
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => setShowSexDropdown(!showSexDropdown)}
                        >
                            <Text style={styles.label}>SEX</Text>
                            <View style={styles.rowRight}>
                                <Text style={styles.value}>{selectedSex}</Text>
                                <FontAwesome
                                    name={showSexDropdown ? "chevron-up" : "chevron-down"}
                                    size={12}
                                    color="#aaa"
                                    style={{ marginLeft: 6 }}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Sex Dropdown Options */}
                        {showSexDropdown && (
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownOption,
                                        selectedSex === 'Female' && styles.dropdownOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedSex('Female');
                                        setShowSexDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownText}>Female</Text>
                                    {selectedSex === 'Female' && (
                                        <FontAwesome name="check" size={14} color="#000" />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.dropdownOption,
                                        selectedSex === 'Male' && styles.dropdownOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedSex('Male');
                                        setShowSexDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownText}>Male</Text>
                                    {selectedSex === 'Male' && (
                                        <FontAwesome name="check" size={14} color="#000" />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.dropdownOption,
                                        selectedSex === 'Other' && styles.dropdownOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedSex('Other');
                                        setShowSexDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownText}>Other</Text>
                                    {selectedSex === 'Other' && (
                                        <FontAwesome name="check" size={14} color="#000" />
                                    )}
                                </TouchableOpacity>


                            </View>
                        )}
                    </View>

                    {/* Birth Date */}
                    <View>
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => setShowDobDropdown(!showDobDropdown)}
                        >
                            <Text style={styles.label}>DOB</Text>
                            <View style={styles.rowRight}>
                                <Text style={styles.value}>{formatDateOfBirth()}</Text>
                                <FontAwesome
                                    name={showDobDropdown ? "chevron-up" : "chevron-down"}
                                    size={12}
                                    color="#aaa"
                                    style={{ marginLeft: 6 }}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Date of Birth Dropdown */}
                        {showDobDropdown && (
                            <View style={styles.dobDropdownContainer}>
                                {/* Day Selection */}
                                <View style={styles.dobSection}>
                                    <Text style={styles.dobSectionTitle}>Day</Text>
                                    <ScrollView style={styles.dobScrollView} showsVerticalScrollIndicator={false}>
                                        {days.map(day => (
                                            <TouchableOpacity
                                                key={day}
                                                style={[
                                                    styles.dobOption,
                                                    selectedDay === day && styles.dobOptionSelected
                                                ]}
                                                onPress={() => setSelectedDay(day)}
                                            >
                                                <Text style={styles.dobText}>{day}</Text>
                                                {selectedDay === day && (
                                                    <FontAwesome name="check" size={12} color="#000" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Month Selection */}
                                <View style={styles.dobSection}>
                                    <Text style={styles.dobSectionTitle}>Month</Text>
                                    <ScrollView style={styles.dobScrollView} showsVerticalScrollIndicator={false}>
                                        {months.map(month => (
                                            <TouchableOpacity
                                                key={month}
                                                style={[
                                                    styles.dobOption,
                                                    selectedMonth === month && styles.dobOptionSelected
                                                ]}
                                                onPress={() => setSelectedMonth(month)}
                                            >
                                                <Text style={styles.dobText}>{month}</Text>
                                                {selectedMonth === month && (
                                                    <FontAwesome name="check" size={12} color="#000" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Year Selection */}
                                <View style={styles.dobSection}>
                                    <Text style={styles.dobSectionTitle}>Year</Text>
                                    <ScrollView style={styles.dobScrollView} showsVerticalScrollIndicator={false}>
                                        {years.map(year => (
                                            <TouchableOpacity
                                                key={year}
                                                style={[
                                                    styles.dobOption,
                                                    selectedYear === year && styles.dobOptionSelected
                                                ]}
                                                onPress={() => setSelectedYear(year)}
                                            >
                                                <Text style={styles.dobText}>{year}</Text>
                                                {selectedYear === year && (
                                                    <FontAwesome name="check" size={12} color="#000" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Close Button */}
                                <TouchableOpacity
                                    style={styles.dobCloseButton}
                                    onPress={() => setShowDobDropdown(false)}
                                >
                                    <Text style={styles.dobCloseText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

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
                        <Text style={styles.sectionTitle}>Select Difficulty</Text>

                        {[
                            ['Easy', 'Medium', 'Hard'],
                        ].map((row, i) => (
                            <View key={i} style={styles.chipRow}>
                                {row.map(diff => (
                                    <TouchableOpacity
                                        key={diff}
                                        onPress={() => setDifficulty(diff)}
                                        style={[
                                            styles.chip,
                                            difficulty == diff && styles.chipSelected
                                        ]}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            difficulty == diff && styles.chipTextSelected
                                        ]}>
                                            {diff}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Padding */}
                    <View style={{flex: 1}}></View>

                    { status && <InformationBubble {...status} /> }

                    {/* Submit Button */}
                    <MainButton onPress={submitProfile} text="Create Profile"/>
                </ScrollView>
            </KeyboardAvoidingView>
        </Container>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
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
    dropdownContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginHorizontal: 10,
        marginTop: -5,
        zIndex: 1000,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownOptionSelected: {
        backgroundColor: '#f9f9f9',
    },
    dropdownText: {
        fontSize: 16,
        color: '#000',
    },
    dobDropdownContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginHorizontal: 10,
        marginTop: -5,
        zIndex: 1000,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        maxHeight: 200,
    },
    dobSection: {
        flex: 1,
        padding: 12,
        borderRightWidth: 1,
        borderRightColor: '#eee',
    },
    dobSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
        color: '#666',
    },
    dobScrollView: {
        maxHeight: 120,
    },
    dobOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    dobOptionSelected: {
        backgroundColor: '#f9f9f9',
    },
    dobText: {
        fontSize: 14,
        color: '#000',
    },
    dobCloseButton: {
        position: 'absolute',
        bottom: 10,
        right: 15,
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    dobCloseText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
});
