import React from 'react';
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

const Home = () => {
    const navigation = useNavigation() as any;

    const handleContinue = () => {
        navigation.navigate('GymSelection');
    };

    const areaValues = [
        ['Chest', require('../../../assets/images/area/Chest.png')], 
        ['Biceps', require('../../../assets/images/area/Biceps.png')], 
        ['Glutes', require('../../../assets/images/area/Glutes.png')], 
        ['Cardio', require('../../../assets/images/area/Cardio.png')]
    ];

    const exerciseValues = [
        ['Chest', 'Chest Press', require('../../../assets/images/excercise/Chest.png')], 
        ['Biceps', 'Bicep Curl', require('../../../assets/images/excercise/Biceps.png')], 
        ['Cardio', 'Treadmill', require('../../../assets/images/excercise/Cardio.png')]
    ];

    return (
        <Container >
            <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                <Search />
                <View style={styles.program}>
                    <Image source={require('../../../assets/images/program.png')} style={{width: '100%', height: '100%', borderRadius: 10}}/>
                </View>

                <Text style={styles.title}>
                    Areas
                    <View style={{width: 10}}></View>
                    <FontAwesome name='chevron-right' size={16}/>
                </Text>
                <ScrollView style={styles.scroll} horizontal>
                    {areaValues.map(val =>    
                        <View key={val[0]} style={styles.areaElement}>
                            <Image source={val[1]} style={{height: 100, width: 100, borderRadius: 40}}/>
                            <Text>{val[0]}</Text>
                        </View>
                    )}
                </ScrollView>

                <Text style={[styles.title, {marginTop: 10}]}>
                    Exercises
                    <View style={{width: 10}}></View>
                    <FontAwesome name='chevron-right' size={16}/>
                </Text>
                <ScrollView style={styles.scroll} horizontal>
                    {exerciseValues.map(val =>    
                        <View key={val[0]} style={styles.exerciseElement}>
                            <Image source={val[2]} style={{height: 150, width: 150, borderRadius: 10, marginBottom: 10}}/>
                            <Text style={{opacity: 0.6}}>{val[0]}</Text>
                            <Text>{val[1]}</Text>
                        </View>
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
    program: {
        height: 150,
        borderRadius: 10,
        marginVertical: 40,
        marginBottom: 20,
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
});
