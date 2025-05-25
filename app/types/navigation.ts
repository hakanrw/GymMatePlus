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
    UserProfile: {
        userId: string;
    };
    Calendar: undefined;
    CoachCalendar: undefined;
    ProgramEditor: {
        traineeId: string;
        traineeName: string;
        currentProgram: {
            [key: string]: {
                exercise: string;
                sets: string;
                rpe: string;
            }[];
        };
    };
    ExerciseDetail: {
        exerciseId: string;
    };
    AreaExercises: {
        area: string;
    };
    // Add other screen params here
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
} 