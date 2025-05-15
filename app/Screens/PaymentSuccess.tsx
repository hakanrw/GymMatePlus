import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Container } from '@/components/Container';
import { MainButton } from '@/components/MainButton';
import { AppContext } from '@/contexts/PingContext';

let LottieView;
    LottieView = require('lottie-react-native').default;


const PaymentSuccess = ({ navigation }: any) => {
    const animation = useRef<any>(null);
    const { ping } = useContext(AppContext);

    useEffect(() => {
        animation.current?.play?.(); // Some Lottie versions require .play()
            // (async () => {
            //     const { sound } = await Audio.Sound.createAsync(
            //         require('../../assets/sounds/apple_pay_success.mp3'),
            //         { shouldPlay: true }
            //     );
            //     sound.setOnPlaybackStatusUpdate((status) => {
            //         if (!(status as any).isLoaded || (status as any).didJustFinish) {
            //             sound.unloadAsync();
            //         }
            //     });
            // })();
    }, []);

    const handleDone = () => ping(); // Re-check gym value in index.tsx (see useEffect there)

    return (
        <Container style={styles.container}>
            <LottieView
                ref={animation}
                source={require('../../assets/animations/success-check.json')}
                autoPlay
                loop
                style={styles.lottie}
            />
            <Text style={styles.title}>Payment Authorized</Text>
            <View style={{ flex: 1 }} />
            <MainButton onPress={handleDone} text="Begin your Journey" />
        </Container>
    );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    lottie: {
        width: 150,
        height: 150,
        marginTop: 200
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 20,
        textAlign: 'center'
    }
});
