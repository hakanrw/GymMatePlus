import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthMethodContextType {
    authMethod: 'email' | 'google' | null;
    setAuthMethod: (method: 'email' | 'google' | null) => void;
}

const AuthMethodContext = createContext<AuthMethodContextType | undefined>(undefined);

export const AuthMethodProvider = ({ children }: { children: ReactNode }) => {
    const [authMethod, setAuthMethod] = useState<'email' | 'google' | null>(null);

    return (
        <AuthMethodContext.Provider value={{ authMethod, setAuthMethod }}>
            {children}
        </AuthMethodContext.Provider>
    );
};

export const useAuthMethod = () => {
    const context = useContext(AuthMethodContext);
    if (context === undefined) {
        throw new Error('useAuthMethod must be used within an AuthMethodProvider');
    }
    return context;
}; 