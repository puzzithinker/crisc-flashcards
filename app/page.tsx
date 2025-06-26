'use client';

import { useState, useCallback } from 'react';
import Flashcard from '../components/Flashcard';
import FlashcardSkeleton from '../components/FlashcardSkeleton';
import ModeSelector from '../components/ModeSelector';
import StatusBar from '../components/StatusBar';
import ControlButtons from '../components/ControlButtons';
import NavigationButtons from '../components/NavigationButtons';
import ProgressIndicator from '../components/ProgressIndicator';
import ErrorMessage from '../components/ErrorMessage';
import ScreenReaderAnnouncements from '../components/ScreenReaderAnnouncements';
import LoadingState from '../components/LoadingState';
import SearchSection from '../components/SearchSection';
import { useFlashcardProgress } from '../hooks/useFlashcardProgress';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useSearch } from '../hooks/useSearch';
import { Card, ReviewMode } from '../types/flashcard';
import flashcardsData from '../data/flashcards.json';

function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export default function Home() {
    const allCardsData = flashcardsData;
    const { 
        isClient, 
        cardProgress, 
        isLoading, 
        loadingMessage,
        progress,
        error,
        clearError,
        getDueCards, 
        handleFeedback, 
        resetAllProgress 
    } = useFlashcardProgress(allCardsData);

    const [currentReviewDeck, setCurrentReviewDeck] = useState<Card[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [currentMode, setCurrentMode] = useState<ReviewMode>('none');
    const [selectedDropdownMode, setSelectedDropdownMode] = useState<ReviewMode>('none');
    const [reviewMessage, setReviewMessage] = useState('Select a mode to begin.');
    const [announcement, setAnnouncement] = useState<string>('');
    const [isFlipped, setIsFlipped] = useState(false);
    const [isStartingReview, setIsStartingReview] = useState(false);

    // Search functionality
    const {
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        filteredCards,
        searchStats,
        highlightText
    } = useSearch({ cards: allCardsData, cardProgress });

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => {
            const newFlipped = !prev;
            if (currentReviewDeck[currentCardIndex]) {
                const card = currentReviewDeck[currentCardIndex];
                setAnnouncement(newFlipped ? 
                    `Definition: ${card.definition}` : 
                    `Term: ${card.term}`
                );
            }
            return newFlipped;
        });
    }, [currentReviewDeck, currentCardIndex]);

    const showNextCard = useCallback(() => {
        if (currentCardIndex < currentReviewDeck.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
            const nextCard = currentReviewDeck[currentCardIndex + 1];
            setAnnouncement(`Moving to card ${currentCardIndex + 2} of ${currentReviewDeck.length}: ${nextCard.term}`);
        } else if (currentReviewDeck.length > 0) {
            setReviewMessage(prev => prev.includes("Complete!") ? prev : prev + " - Deck Complete!");
            setAnnouncement("You have reached the end of the deck.");
        }
    }, [currentCardIndex, currentReviewDeck]);

    const startReview = useCallback(async (mode: ReviewMode, useFiltered: boolean = false) => {
        try {
            if (isLoading) {
                setReviewMessage("Loading progress, please wait...");
                return;
            }
            
            setIsStartingReview(true);
            console.log(`Starting review in mode: ${mode}`);
            setCurrentMode(mode);
            let deck: Card[] = [];
            let message = "";

            if (mode === 'full') {
                const sourceCards = useFiltered ? filteredCards : allCardsData;
                if (!Array.isArray(sourceCards) || sourceCards.length === 0) {
                    setReviewMessage(useFiltered ? "No cards match your search criteria" : "No flashcard data available");
                    setIsStartingReview(false);
                    return;
                }
                
                // Simulate deck preparation time
                await new Promise(resolve => setTimeout(resolve, 200));
                deck = [...sourceCards];
                message = useFiltered 
                    ? `Filtered Review (${deck.length} cards)`
                    : `Full Deck Review (${deck.length} cards)`;
            } else if (mode === 'srs') {
                // Simulate SRS calculation time
                await new Promise(resolve => setTimeout(resolve, 300));
                let dueCards = getDueCards();
                
                // Apply search filters to SRS cards if active
                if (useFiltered && (searchStats.hasActiveFilters || searchStats.hasSearchQuery)) {
                    const filteredIds = new Set(filteredCards.map(card => card.id));
                    dueCards = dueCards.filter(card => filteredIds.has(card.id));
                }
                
                deck = dueCards;
                message = useFiltered 
                    ? `Filtered SRS (${deck.length} due cards)`
                    : `SRS Review (${deck.length} due cards)`;
            } else {
                setCurrentReviewDeck([]);
                setCurrentCardIndex(0);
                setReviewMessage("Select a mode to begin.");
                setCurrentMode('none');
                setIsFlipped(false);
                setIsStartingReview(false);
                return;
            }

            if (deck.length === 0) {
                message += " - No cards to review!";
                setCurrentReviewDeck([]);
                setCurrentCardIndex(0);
            } else {
                // Simulate shuffling time for large decks
                if (deck.length > 100) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                const shuffledDeck = shuffleArray([...deck]);
                setCurrentReviewDeck(shuffledDeck);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                message += " (Shuffled)";
                setAnnouncement(`Starting ${mode === 'full' ? 'full deck' : 'SRS'} review with ${deck.length} cards.`);
            }
            setReviewMessage(message);
            setIsStartingReview(false);
        } catch (error) {
            console.error("Error starting review:", error);
            setReviewMessage("Failed to start review. Please try again.");
            setIsStartingReview(false);
        }
    }, [allCardsData, filteredCards, getDueCards, isLoading, searchStats]);

    const handleModeChange = (mode: ReviewMode) => {
        setSelectedDropdownMode(mode);
        const useFiltered = searchStats.hasActiveFilters || searchStats.hasSearchQuery;
        startReview(mode, useFiltered);
    };

    const handleSearchCardSelect = useCallback((selectedCard: Card) => {
        // Create a deck starting with the selected card
        let deck: Card[] = [];
        const useFiltered = searchStats.hasActiveFilters || searchStats.hasSearchQuery;
        const sourceCards = useFiltered ? filteredCards : allCardsData;
        
        // Find the selected card index and reorder deck to start from there
        const selectedIndex = sourceCards.findIndex(card => card.id === selectedCard.id);
        if (selectedIndex !== -1) {
            deck = [
                ...sourceCards.slice(selectedIndex),
                ...sourceCards.slice(0, selectedIndex)
            ];
        } else {
            deck = [selectedCard, ...sourceCards.filter(card => card.id !== selectedCard.id)];
        }

        setCurrentReviewDeck(deck);
        setCurrentCardIndex(0);
        setCurrentMode('full');
        setSelectedDropdownMode('full');
        setIsFlipped(false);
        setReviewMessage(`Search Result Review (${deck.length} cards) - Starting with: ${selectedCard.term}`);
        setAnnouncement(`Starting review with selected card: ${selectedCard.term}`);
    }, [filteredCards, allCardsData, searchStats]);

    const startFilteredReview = useCallback(() => {
        if (!searchStats.hasActiveFilters && !searchStats.hasSearchQuery) {
            return;
        }
        
        setSelectedDropdownMode('full');
        startReview('full', true);
    }, [searchStats, startReview]);

    const handleCardFeedback = useCallback((cardId: number, isEasy: boolean) => {
        handleFeedback(cardId, isEasy);
        
        if (currentMode === 'srs') {
            setCurrentReviewDeck(prevDeck => {
                const newDeck = prevDeck.filter(card => card.id !== cardId);
                if (newDeck.length === 0) {
                    setReviewMessage("SRS Review Complete!");
                    setCurrentCardIndex(0);
                } else if (currentCardIndex >= newDeck.length) {
                    setCurrentCardIndex(newDeck.length - 1);
                }
                return newDeck;
            });
        } else {
            showNextCard();
        }
    }, [handleFeedback, currentMode, currentCardIndex, showNextCard]);

    const showPrevCard = useCallback(() => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
            const prevCard = currentReviewDeck[currentCardIndex - 1];
            setAnnouncement(`Moving to card ${currentCardIndex} of ${currentReviewDeck.length}: ${prevCard.term}`);
        }
    }, [currentCardIndex, currentReviewDeck]);

    const shuffleCurrent = useCallback(() => {
        if (currentReviewDeck.length > 1) {
            setCurrentReviewDeck(prev => shuffleArray([...prev]));
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setReviewMessage(prev => prev.includes("(Shuffled)") ? prev : prev + " (Shuffled)");
            setAnnouncement("Deck shuffled. Starting from the first card.");
        }
    }, [currentReviewDeck.length]);

    const handleResetProgress = () => {
        const wasReset = resetAllProgress();
        if (wasReset) {
            setCurrentMode('none');
            setCurrentReviewDeck([]);
            setCurrentCardIndex(0);
            setReviewMessage("Progress reset. Select a mode.");
            setSelectedDropdownMode('none');
            setIsFlipped(false);
            setAnnouncement("All progress has been reset. Please select a study mode to begin.");
        }
    };

    const handleKeyboardFeedback = useCallback((isEasy: boolean) => {
        if (currentReviewDeck[currentCardIndex] && isFlipped) {
            handleCardFeedback(currentReviewDeck[currentCardIndex].id, isEasy);
            setAnnouncement(isEasy ? "Marked as easy" : "Marked as hard");
        }
    }, [currentReviewDeck, currentCardIndex, isFlipped, handleCardFeedback]);

    // Keyboard navigation
    useKeyboardNavigation({
        onPrevious: showPrevCard,
        onNext: showNextCard,
        onFlip: handleFlip,
        onEasy: () => handleKeyboardFeedback(true),
        onHard: () => handleKeyboardFeedback(false),
        canNavigate: currentReviewDeck.length > 0,
        isFlipped,
        isFirstCard: currentCardIndex === 0,
        isLastCard: currentCardIndex === currentReviewDeck.length - 1
    });

    const currentCard = currentReviewDeck[currentCardIndex];
    const currentCardProg = currentCard ? cardProgress[currentCard.id] : null;
    const canNavigate = currentReviewDeck.length > 0;

    return (
        <div className="px-8 flex flex-col justify-center items-center min-h-screen bg-gray-100">
            <ScreenReaderAnnouncements message={announcement} />
            
            <main id="main-content" className="py-16 px-4 flex-1 flex flex-col justify-start items-center w-full max-w-2xl bg-white rounded-xl shadow-lg my-8">
                <header>
                    <h1 className="mb-8 text-5xl text-center text-slate-800 font-semibold">CRISC Flashcards</h1>
                    <div className="sr-only">
                        <p>An interactive flashcard study tool for CRISC (Certified in Risk and Information Systems Control) terms.</p>
                        <p>Keyboard shortcuts: Space to flip cards, Arrow keys to navigate, 1 for hard, 2 for easy, ? for help.</p>
                    </div>
                </header>

                {error && (
                    <ErrorMessage
                        title="Storage Error"
                        message={error}
                        onDismiss={clearError}
                        onRetry={() => window.location.reload()}
                    />
                )}

                <ModeSelector 
                    selectedMode={selectedDropdownMode}
                    onModeChange={handleModeChange}
                />

                {/* Search and Filter Section */}
                <div className="w-full max-w-2xl my-4">
                    <SearchSection
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filters={filters}
                        onFiltersChange={setFilters}
                        searchResults={filteredCards}
                        totalCards={allCardsData.length}
                        onCardSelect={handleSearchCardSelect}
                        highlightText={highlightText}
                        disabled={isLoading || isStartingReview}
                    />

                    {/* Filtered Review Button */}
                    {(searchStats.hasActiveFilters || searchStats.hasSearchQuery) && filteredCards.length > 0 && (
                        <div className="mt-3 text-center">
                            <button
                                onClick={startFilteredReview}
                                disabled={isLoading || isStartingReview}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                aria-label={`Start review with ${filteredCards.length} filtered cards`}
                            >
                                Study Filtered Cards ({filteredCards.length})
                            </button>
                        </div>
                    )}
                </div>

                <StatusBar 
                    reviewMessage={reviewMessage}
                    totalCards={allCardsData.length}
                />

                <ControlButtons
                    onShuffle={shuffleCurrent}
                    onResetProgress={handleResetProgress}
                    canShuffle={canNavigate && currentReviewDeck.length > 1}
                    isClient={isClient}
                />

                {isLoading && (
                    <LoadingState
                        isLoading={isLoading}
                        message={loadingMessage}
                        progress={progress}
                        size="medium"
                    />
                )}

                {isStartingReview && (
                    <LoadingState
                        isLoading={isStartingReview}
                        message="Preparing your study session..."
                        size="medium"
                    />
                )}

                {!isLoading && currentMode !== 'none' && (
                    <section aria-label="Flashcard study area">
                        <ProgressIndicator
                            currentIndex={currentCardIndex}
                            totalCards={currentReviewDeck.length}
                            canNavigate={canNavigate}
                        />

                        {isStartingReview ? (
                            <FlashcardSkeleton />
                        ) : currentCard ? (
                            <Flashcard
                                card={currentCard}
                                progress={currentCardProg}
                                onFeedback={handleCardFeedback}
                                cardNumber={currentCardIndex + 1}
                                totalCards={currentReviewDeck.length}
                                isFlipped={isFlipped}
                                onFlip={handleFlip}
                            />
                        ) : (
                             <div className="flashcard-container my-6 mx-auto w-full h-80 min-h-64" role="status" aria-live="polite">
                                <div className="card-face absolute w-full h-full flex flex-col justify-center items-center p-6 border border-gray-300 rounded-lg bg-gray-50 text-xl text-center">
                                    {reviewMessage.includes("Complete") || reviewMessage.includes("No cards") ? reviewMessage : "Loading..."}
                                </div>
                            </div>
                        )}

                        <NavigationButtons
                            onPrevious={showPrevCard}
                            onNext={showNextCard}
                            canNavigate={canNavigate}
                            isFirstCard={currentCardIndex === 0}
                            isLastCard={currentCardIndex === currentReviewDeck.length - 1}
                        />
                    </section>
                )}
                 {!isLoading && currentMode === 'none' && (
                     <div className="mt-8 text-center" role="status">
                        <p className="text-gray-600">Please select a review mode above to begin studying.</p>
                        <p className="sr-only">Use the dropdown menu to choose between Full Deck Review or SRS Due Cards mode.</p>
                     </div>
                 )}
            </main>
        </div>
    );
}