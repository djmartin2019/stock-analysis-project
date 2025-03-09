"use client";

import { usePathname } from 'next/navigation';
import { createContext, useContext, useState } from 'react';

interface TickerContextType {
    selectedTicker: string;
    setSelectedTicker: (ticker: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isPageTransitioning: boolean;
    setIsPageTransitioning: (transitioning: boolean) => void;
    isDataLoading: boolean;
    setIsDataLoading: (loading: boolean) => void;
}

const TickerContext = createContext<TickerContextType | undefined>(undefined);

export function TickerProvider({ children }: { children: React.ReactNode }) {
    const [selectedTicker, setSelectedTicker] = useState<string>('AAPL');
    const [isLoading, setIsLoading] = useState(false);
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);

    return (
        <TickerContext.Provider value={{
            selectedTicker,
            setSelectedTicker,
            isLoading,
            setIsLoading,
            isPageTransitioning,
            setIsPageTransitioning,
            isDataLoading,
            setIsDataLoading
        }}>
            {children}
        </TickerContext.Provider>
    );
}


export function useTicker() {
    const context = useContext(TickerContext);
    if (context === undefined) {
        throw new Error('useTicker must be used within a TickerProvider');
    }
    return context;
}

