export type RootStackParamList = {
    Main: undefined;
    ChatRoom: {
        name: string;
    };
    // Add other screen params here
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
} 