import { useState, useCallback } from 'react';

export interface LoadingState {
    isLoading: boolean;
    loadingMessage?: string;
    progress?: {
        current: number;
        total: number;
    };
}

export const useLoadingState = (initialState: LoadingState = { isLoading: false }) => {
    const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

    const setLoading = useCallback((isLoading: boolean, message?: string) => {
        setLoadingState(prev => ({
            ...prev,
            isLoading,
            loadingMessage: message,
            ...(isLoading ? {} : { progress: undefined })
        }));
    }, []);

    const setProgress = useCallback((current: number, total: number, message?: string) => {
        setLoadingState(prev => ({
            ...prev,
            isLoading: true,
            loadingMessage: message || prev.loadingMessage,
            progress: { current, total }
        }));
    }, []);

    const clearLoading = useCallback(() => {
        setLoadingState({ isLoading: false });
    }, []);

    return {
        ...loadingState,
        setLoading,
        setProgress,
        clearLoading
    };
};