import { useState, useEffect, useCallback } from 'react';
import { Card, Progress } from '../types/flashcard';
import { useLoadingState } from './useLoadingState';

const LOCAL_STORAGE_KEY = 'criscFlashcardProgress_v2';
const LEITNER_BOXES = 5;
const REVIEW_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export const useFlashcardProgress = (allCardsData: Card[]) => {
    const [isClient, setIsClient] = useState(false);
    const [cardProgress, setCardProgress] = useState<Record<number, Progress>>({});
    const [error, setError] = useState<string | null>(null);
    const loadingState = useLoadingState({ isLoading: true, loadingMessage: 'Initializing flashcards...' });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
        const loadProgress = async () => {
            try {
                setError(null);
                loadingState.setLoading(true, "Loading your study progress...");
                console.log("Attempting to load progress from localStorage...");
                
                if (!window.localStorage) {
                    throw new Error("localStorage is not available in this browser");
                }

                // Simulate network delay for better UX demonstration
                await new Promise(resolve => setTimeout(resolve, 300));

                const savedProgressRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
                let loadedProgress: Record<number, Progress> = {};
                let needsSave = false;

                loadingState.setLoading(true, "Parsing saved progress...");

                if (savedProgressRaw) {
                    try {
                        const parsed = JSON.parse(savedProgressRaw);
                        
                        // Validate the parsed data structure
                        if (typeof parsed === 'object' && parsed !== null) {
                            loadedProgress = parsed;
                            console.log("Progress loaded successfully.");
                        } else {
                            throw new Error("Invalid progress data format");
                        }
                    } catch (parseError) {
                        console.error("Failed to parse saved progress:", parseError);
                        setError("Failed to load saved progress. Starting fresh.");
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                        needsSave = true;
                    }
                } else {
                     console.log("No saved progress found, initializing.");
                     needsSave = true;
                }

                // Validate and initialize card progress
                if (!Array.isArray(allCardsData) || allCardsData.length === 0) {
                    throw new Error("Invalid flashcard data");
                }

                loadingState.setLoading(true, "Initializing flashcard progress...");
                
                // Show progress for card initialization
                allCardsData.forEach((card, index) => {
                    loadingState.setProgress(index + 1, allCardsData.length, "Setting up flashcards...");
                    
                    if (!card?.id || typeof card.id !== 'number') {
                        console.warn("Invalid card data:", card);
                        return;
                    }

                    if (!loadedProgress[card.id]) {
                        loadedProgress[card.id] = { box: 1, lastReviewed: 0 };
                        needsSave = true;
                    }
                     
                    const progress = loadedProgress[card.id];
                    if (typeof progress?.box !== 'number' || progress.box < 1 || progress.box > LEITNER_BOXES + 1) {
                         loadedProgress[card.id] = { ...progress, box: 1 };
                         needsSave = true;
                     }
                     if (typeof progress?.lastReviewed !== 'number' || progress.lastReviewed < 0) {
                         loadedProgress[card.id] = { ...progress, lastReviewed: 0 };
                         needsSave = true;
                     }
                });

                setCardProgress(loadedProgress);

                if (needsSave) {
                    try {
                        loadingState.setLoading(true, "Saving progress...");
                        console.log("Saving initialized/updated progress...");
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedProgress));
                    } catch (saveError) {
                        console.error("Failed to save progress:", saveError);
                        setError("Unable to save progress. Your changes may not persist.");
                    }
                }

                loadingState.clearLoading();
            } catch (error) {
                console.error("Error loading progress:", error);
                setError(error instanceof Error ? error.message : "Failed to load flashcard progress");
                loadingState.clearLoading();
                
                // Initialize with default progress as fallback
                const defaultProgress: Record<number, Progress> = {};
                allCardsData.forEach(card => {
                    if (card?.id) {
                        defaultProgress[card.id] = { box: 1, lastReviewed: 0 };
                    }
                });
                setCardProgress(defaultProgress);
            }
        };

        loadProgress();
    }, [isClient, allCardsData]);

    useEffect(() => {
        if (!isClient || loadingState.isLoading) return;
        if (Object.keys(cardProgress).length > 0) {
            try {
                console.log("Saving progress to localStorage...");
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cardProgress));
                // Clear any previous save errors
                if (error?.includes("save")) {
                    setError(null);
                }
            } catch (saveError) {
                console.error("Failed to save progress:", saveError);
                setError("Unable to save progress. Your changes may not persist.");
            }
        } else {
             console.log("Skipping save of empty progress object.");
        }
    }, [cardProgress, isClient, loadingState.isLoading, error]);

    const getDueCards = useCallback(() => {
        if (loadingState.isLoading) return [];

        try {
            const now = Date.now();
            const due: Card[] = [];
            
            if (!Array.isArray(allCardsData)) {
                console.error("Invalid allCardsData in getDueCards");
                return [];
            }

            allCardsData.forEach(card => {
                if (!card?.id) {
                    console.warn("Invalid card in getDueCards:", card);
                    return;
                }

                const progress = cardProgress[card.id];
                if (!progress || typeof progress.box !== 'number' || progress.box < 1 || progress.box > LEITNER_BOXES) {
                    return;
                }

                const intervalDays = REVIEW_INTERVALS[progress.box as keyof typeof REVIEW_INTERVALS];
                if (!intervalDays || typeof intervalDays !== 'number') {
                    return;
                }

                const intervalMillis = intervalDays * 24 * 60 * 60 * 1000;
                const dueDate = progress.lastReviewed + intervalMillis;

                if (now >= dueDate) {
                    due.push(card);
                }
            });
            
            console.log(`Found ${due.length} cards due for review.`);
            return due;
        } catch (error) {
            console.error("Error in getDueCards:", error);
            return [];
        }
    }, [allCardsData, cardProgress, loadingState.isLoading]);

    const handleFeedback = useCallback((cardId: number, isEasy: boolean) => {
        if (loadingState.isLoading) return;

        try {
            if (typeof cardId !== 'number' || cardId <= 0) {
                console.error("Invalid cardId in handleFeedback:", cardId);
                return;
            }

            if (typeof isEasy !== 'boolean') {
                console.error("Invalid isEasy value in handleFeedback:", isEasy);
                return;
            }

            const now = Date.now();
            const currentBox = cardProgress[cardId]?.box ?? 1;
            let nextBox;

            if (isEasy) {
                nextBox = Math.min(currentBox + 1, LEITNER_BOXES + 1);
            } else {
                nextBox = 1;
            }

            // Validate nextBox
            if (nextBox < 1 || nextBox > LEITNER_BOXES + 1) {
                console.error("Invalid nextBox calculated:", nextBox);
                nextBox = 1; // Fallback to box 1
            }

            setCardProgress(prev => ({
                ...prev,
                [cardId]: { box: nextBox, lastReviewed: now }
            }));

            console.log(`Card ${cardId} feedback: ${isEasy ? 'Easy' : 'Hard'}. Box: ${currentBox} -> ${nextBox}`);
        } catch (error) {
            console.error("Error in handleFeedback:", error);
        }
    }, [cardProgress, loadingState.isLoading]);

    const resetAllProgress = useCallback(() => {
        if (!isClient) return;
        if (confirm("Are you sure you want to reset all card progress? All cards will return to Box 1.")) {
            const resetProgress: Record<number, Progress> = {};
            allCardsData.forEach(card => {
                resetProgress[card.id] = { box: 1, lastReviewed: 0 };
            });
            setCardProgress(resetProgress);
            console.log("All card progress reset.");
            return true;
        }
        return false;
    }, [isClient, allCardsData]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isClient,
        cardProgress,
        isLoading: loadingState.isLoading,
        loadingMessage: loadingState.loadingMessage,
        progress: loadingState.progress,
        error,
        clearError,
        getDueCards,
        handleFeedback,
        resetAllProgress
    };
};