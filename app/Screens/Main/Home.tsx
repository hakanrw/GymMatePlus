import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar as RNStatusBar,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MainButton } from '@/components/MainButton';
import { Container } from '@/components/Container';
import { Dumbell } from '@/components/Dumbell';
import { Search } from '@/components/SearchBar';
import { FontAwesome } from '@expo/vector-icons';
import { collection, query, where, getDocs, FirestoreError, limit } from '@firebase/firestore';
import { firestore, auth } from '../../firebaseConfig';

interface User {
    id: string;
    displayName: string;
    photoURL: string;
    email: string;
}

interface Exercise {
    id: string;
    name: string;
    area: string;
    imageUrl?: string;
}

const Home = () => {
    const navigation = useNavigation() as any;
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [featuredExercises, setFeaturedExercises] = useState<Exercise[]>([]);
    const searchContainerRef = useRef<View>(null);

    useEffect(() => {
        const handleClickOutside = () => {
            // For mobile, we'll handle this differently through touch events
            if (Platform.OS !== 'web') {
                setShowResults(false);
            }
        };

        // Only add document listeners on web platform
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
            const handleWebClickOutside = (event: any) => {
                const target = event.target as HTMLElement;
                if (searchContainerRef.current && !target.closest('[data-search-container]')) {
                    setShowResults(false);
                }
            };
            
            document.addEventListener('click', handleWebClickOutside);
            return () => {
                document.removeEventListener('click', handleWebClickOutside);
            };
        }
    }, []);

    useEffect(() => {
        fetchFeaturedExercises();
    }, []);

    const fetchFeaturedExercises = async () => {
        try {
            const exercisesRef = collection(firestore, 'exercises');
            const q = query(exercisesRef, limit(6)); // Get first 6 exercises as featured
            const querySnapshot = await getDocs(q);
            
            const exercises: Exercise[] = [];
            querySnapshot.forEach((doc) => {
                exercises.push({
                    id: doc.id,
                    ...doc.data()
                } as Exercise);
            });

            setFeaturedExercises(exercises);
        } catch (error) {
            console.error('Error fetching featured exercises:', error);
        }
    };

    const handleSearch = async (searchText: string) => {
        if (searchText.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const usersRef = collection(firestore, 'users');
            const querySnapshot = await getDocs(usersRef);
            const users: User[] = [];
            const currentUserEmail = auth.currentUser?.email;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (
                    data.displayName &&
                    data.displayName.toLowerCase().includes(searchText.toLowerCase()) &&
                    data.email !== currentUserEmail // Exclude self
                ) {
                    users.push({
                        id: doc.id,
                        displayName: data.displayName,
                        photoURL: data.photoURL || '',
                        email: data.email || ''
                    });
                }
            });

            setSearchResults(users);
            setShowResults(true);
        } catch (error) {
            console.error('Error searching users:', error);
            if (error instanceof FirestoreError) {
                console.error('Firestore error details:', error.message);
            }
        }
    };

    const handleUserSelect = (user: User) => {
        setShowResults(false);
        console.log('handleUserSelect called with user:', user);
        console.log('Navigating to UserProfile with userId:', user.id);
        navigation.navigate('UserProfile', { userId: user.id });
    };

    const handleAreaPress = (area: string) => {
        navigation.navigate('AreaExercises', { area });
    };

    const handleExercisePress = (exerciseId: string) => {
        navigation.navigate('ExerciseDetail', { exerciseId });
    };

    const areaValues = [
        ['Chest', require('../../../assets/images/area/Chest.png')], 
        ['Biceps', require('../../../assets/images/area/Biceps.png')], 
        ['Core', require('../../../assets/images/area/Glutes.png')], 
        ['Glutes', require('../../../assets/images/area/Glutes.png')], 
        ['Legs', require('../../../assets/images/area/Glutes.png')], 
        ['Triceps', require('../../../assets/images/area/Glutes.png')], 
        ['Back', require('../../../assets/images/area/Glutes.png')], 
        ['Shoulders', require('../../../assets/images/area/Glutes.png')], 
        ['Cardio', require('../../../assets/images/area/Cardio.png')]
    ];

    return (
        <Container style={{ position: 'relative' }}>
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
                style={{ position: 'relative', zIndex: 1 }}
            >
                <View 
                    ref={searchContainerRef}
                    data-search-container
                    style={styles.searchContainer}
                >
                    <Search onSearch={handleSearch} />
                    {showResults && searchResults.length > 0 && (
                        <View style={styles.searchResults}>
                            {searchResults.map((user) => (
                                <TouchableOpacity
                                    key={user.id}
                                    style={styles.searchResultItem}
                                    onPress={() => handleUserSelect(user)}
                                >
                                    <Image
                                        source={{ uri: user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                                        style={styles.userAvatar}
                                    />
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{user.displayName}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.program}>
                    <TouchableOpacity style={{width: '100%', height: '100%'}} onPress={() => navigation.navigate('Calendar')}>
                        <Image source={require('../../../assets/images/program.png')} style={{width: '100%', height: '100%', borderRadius: 10}}/>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>
                    Areas
                    <View style={{width: 10}}></View>
                    <FontAwesome name='chevron-right' size={16}/>
                </Text>
                <ScrollView style={styles.scroll} horizontal>
                    {areaValues.map(val =>    
                        <TouchableOpacity 
                            key={val[0]} 
                            style={styles.areaElement}
                            onPress={() => handleAreaPress(val[0] as string)}
                            activeOpacity={0.7}
                        >
                            <Image source={val[1]} style={{height: 100, width: 100, borderRadius: 40}}/>
                            <Text>{val[0]}</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                <Text style={[styles.title, {marginTop: 10}]}>
                    Featured Exercises
                    <View style={{width: 10}}></View>
                    <FontAwesome name='chevron-right' size={16}/>
                </Text>
                <ScrollView style={styles.scroll} horizontal>
                    {featuredExercises.map(exercise =>    
                        <TouchableOpacity 
                            key={exercise.id} 
                            style={styles.exerciseElement}
                            onPress={() => handleExercisePress(exercise.id)}
                            activeOpacity={0.7}
                        >
                            {exercise.imageUrl ? (
                                <Image 
                                    source={{ uri: exercise.imageUrl }} 
                                    style={{height: 150, width: 150, borderRadius: 10, marginBottom: 10}}
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <FontAwesome name="image" size={32} color="#ccc" />
                                </View>
                            )}
                            <Text style={{opacity: 0.6}}>{exercise.area}</Text>
                            <Text>{exercise.name}</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
                
                {/* Padding */}
                <View style={{height: 20}}/>
            </ScrollView>
        </Container>
    );
};

export default Home;

const styles = StyleSheet.create({
    searchContainer: {
        position: 'relative',
        zIndex: 1000,
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    searchResults: {
        position: 'absolute',
        top: '100%',
        left: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: 300,
        zIndex: 1001,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: 'white',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    program: {
        height: 150,
        borderRadius: 10,
        marginVertical: 40,
        marginBottom: 20,
        position: 'relative',
        zIndex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    areaElement: {
        width: 100,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        marginRight: 30,
        gap: 15
    },
    scroll: {
        paddingBottom: 20,
    },
    exerciseElement: {
        width: 150,
        alignItems: 'flex-start',
        flexDirection: 'column',
        justifyContent: 'center',
        marginRight: 15,
        gap: 5
    },
    placeholderImage: {
        height: 150,
        width: 150,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
