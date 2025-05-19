export type AccountType = 'user' | 'coach' | 'admin';

export interface User {
    id: string;
    displayName: string;
    photoURL: string;
    email: string;
    accountType: AccountType;
    weight?: number;
    height?: number;
    fitnessGoals?: string[];
    onBoardingComplete: boolean;
    gym?: number | null;
    createdAt: Date;
}

export interface UserProfile {
    displayName: string;
    photoURL: string;
    email: string;
    weight?: number;
    height?: number;
    fitnessGoals?: string[];
    accountType: AccountType;
} 