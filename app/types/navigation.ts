export type RootStackParamList = {
    SignUp: undefined;
    Welcome: undefined;
    GymSelection: undefined;
    Payment: undefined;
    PaymentSuccess: undefined;
    UserSelection: undefined;
    ChatRoom: {
        chatId?: string;
        name: string;
        photoURL?: string;
        userId?: string;
    };
    // Add other screen params here
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
} 