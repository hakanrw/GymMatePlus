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
    AIChat: undefined;
    EntryHistory: undefined;
    Settings: undefined;
    TraineeEntries: undefined;
    // Add other screen params here
};

export type HomeStackParamList = {
    HomeMain: undefined;
    ExerciseDetail: {
        exerciseId: string;
    };
    AreaExercises: {
        area: string;
    };
    Exercises: undefined;
};

export type CalendarStackParamList = {
    CalendarMain: undefined;
    ExerciseDetail: {
        exerciseId: string;
    };
    AreaExercises: {
        area: string;
    };
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
} 