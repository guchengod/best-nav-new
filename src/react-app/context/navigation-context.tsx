import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
    selectedCategory: string | null;
    selectedSubCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
    setSelectedSubCategory: (subCategory: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

    return (
        <NavigationContext.Provider
            value={{
                selectedCategory,
                selectedSubCategory,
                setSelectedCategory,
                setSelectedSubCategory,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}
