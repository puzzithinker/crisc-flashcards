// pages/index.js
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import fs from 'fs';
import path from 'path';
import Flashcard from '../components/Flashcard';
import styles from '../styles/Home.module.css';

// --- Constants ---
const LOCAL_STORAGE_KEY = 'criscFlashcardProgress_v2';
const LEITNER_BOXES = 5;
const REVIEW_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }; // Days

// --- Helper Functions ---
function shuffleArray(array) {
    // ... (shuffle function remains the same)
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// --- Page Component ---
export default function Home({ allCardsData }) {
    // --- State ---
    const [isClient, setIsClient] = useState(false);
    const [cardProgress, setCardProgress] = useState({});
    const [currentReviewDeck, setCurrentReviewDeck] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [currentMode, setCurrentMode] = useState('none'); // 'full', 'srs', 'none' (Internal app mode)
    const [selectedDropdownMode, setSelectedDropdownMode] = useState('none'); // <-- NEW: State for dropdown value
    const [reviewMessage, setReviewMessage] = useState('Select a mode to begin.');
    const [isLoading, setIsLoading] = useState(true);

    // --- Effects ---
    // ... (useEffect hooks remain the same) ...
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        // ... (loading logic remains the same) ...
        console.log("Attempting to load progress from localStorage...");
        const savedProgressRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        let loadedProgress = {};
        let needsSave = false;

        if (savedProgressRaw) {
            try {
                loadedProgress = JSON.parse(savedProgressRaw);
                console.log("Progress loaded successfully.");
            } catch (e) {
                console.error("Failed to parse saved progress:", e);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        } else {
             console.log("No saved progress found, initializing.");
             needsSave = true;
        }

        allCardsData.forEach(card => {
            if (!loadedProgress[card.id]) {
                loadedProgress[card.id] = { box: 1, lastReviewed: 0 };
                needsSave = true;
            }
             if (typeof loadedProgress[card.id]?.box !== 'number') {
                 loadedProgress[card.id] = { ...loadedProgress[card.id], box: 1 };
                 needsSave = true;
             }
             if (typeof loadedProgress[card.id]?.lastReviewed !== 'number') {
                 loadedProgress[card.id] = { ...loadedProgress[card.id], lastReviewed: 0 };
                 needsSave = true;
             }
        });

        setCardProgress(loadedProgress);
        setIsLoading(false);

        if (needsSave) {
            console.log("Saving initialized/updated progress...");
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedProgress));
        }
    }, [isClient, allCardsData]);

    useEffect(() => {
        if (!isClient || isLoading) return;
        if (Object.keys(cardProgress).length > 0) {
             console.log("Saving progress to localStorage...");
             localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cardProgress));
        } else {
             console.log("Skipping save of empty progress object.");
        }
    }, [cardProgress, isClient, isLoading]);

    // --- Review Logic ---
    const getDueCards = useCallback(() => {
        // ... (getDueCards function remains the same) ...
        if (isLoading) return [];

        const now = Date.now();
        const due = [];
        allCardsData.forEach(card => {
            const progress = cardProgress[card.id];
            if (!progress || progress.box < 1 || progress.box > LEITNER_BOXES) return;

            const intervalDays = REVIEW_INTERVALS[progress.box];
            if (!intervalDays) return;

            const intervalMillis = intervalDays * 24 * 60 * 60 * 1000;
            const dueDate = progress.lastReviewed + intervalMillis;

            if (now >= dueDate) {
                due.push(card);
            }
        });
        console.log(`Found ${due.length} cards due for review.`);
        return due;
    }, [allCardsData, cardProgress, isLoading]);

    const startReview = useCallback((mode) => {
        if (isLoading) {
            setReviewMessage("Loading progress, please wait...");
            return;
        }
        console.log(`Starting review in mode: ${mode}`);
        setCurrentMode(mode); // Set the internal app mode
        let deck = [];
        let message = "";

        if (mode === 'full') {
            deck = [...allCardsData];
            message = `Full Deck Review (${deck.length} cards)`;
        } else if (mode === 'srs') {
            deck = getDueCards();
            message = `SRS Review (${deck.length} due cards)`;
        } else {
            // This case handles selecting "-- Select Mode --" or resetting
            setCurrentReviewDeck([]);
            setCurrentCardIndex(0);
            setReviewMessage("Select a mode to begin.");
            setCurrentMode('none'); // Ensure internal mode is also 'none'
            return;
        }

        if (deck.length === 0) {
            message += " - No cards to review!";
            setCurrentReviewDeck([]);
            setCurrentCardIndex(0);
        } else {
            setCurrentReviewDeck(shuffleArray(deck));
            setCurrentCardIndex(0);
            message += " (Shuffled)";
        }
        setReviewMessage(message);
    }, [allCardsData, getDueCards, isLoading]);

    const handleFeedback = useCallback((cardId, isEasy) => {
       // ... (handleFeedback function remains the same) ...
       if (isLoading) return;

        const now = Date.now();
        let nextBox;
        const currentBox = cardProgress[cardId]?.box ?? 1;

        if (isEasy) {
            nextBox = Math.min(currentBox + 1, LEITNER_BOXES + 1);
        } else {
            nextBox = 1;
        }

        setCardProgress(prev => ({
            ...prev,
            [cardId]: { box: nextBox, lastReviewed: now }
        }));

        console.log(`Card ${cardId} feedback: ${isEasy ? 'Easy' : 'Hard'}. Box: ${currentBox} -> ${nextBox}`);

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
    }, [cardProgress, currentMode, currentCardIndex, isLoading]); // Added isLoading dependency

    // --- Navigation ---
    const showNextCard = () => {
       // ... (showNextCard function remains the same) ...
        if (currentCardIndex < currentReviewDeck.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else if (currentReviewDeck.length > 0) {
            setReviewMessage(prev => prev.includes("Complete!") ? prev : prev + " - Deck Complete!");
        }
    };

    const showPrevCard = () => {
       // ... (showPrevCard function remains the same) ...
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    const shuffleCurrent = () => {
       // ... (shuffleCurrent function remains the same) ...
        if (currentReviewDeck.length > 1) {
            setCurrentReviewDeck(prev => shuffleArray([...prev]));
            setCurrentCardIndex(0);
            setReviewMessage(prev => prev.includes("(Shuffled)") ? prev : prev + " (Shuffled)");
        }
    };

    const resetAllProgressConfirm = () => {
        if (!isClient) return;
        if (confirm("Are you sure you want to reset all card progress? All cards will return to Box 1.")) {
            const resetProgress = {};
            allCardsData.forEach(card => {
                resetProgress[card.id] = { box: 1, lastReviewed: 0 };
            });
            setCardProgress(resetProgress);
            setCurrentMode('none'); // Reset internal mode
            setCurrentReviewDeck([]);
            setCurrentCardIndex(0);
            setReviewMessage("Progress reset. Select a mode.");
            setSelectedDropdownMode('none'); // <-- RESET DROPDOWN STATE
            console.log("All card progress reset.");
        }
    };

    // --- Handler for Dropdown Change ---
    const handleModeChange = (event) => {
        const newMode = event.target.value;
        setSelectedDropdownMode(newMode); // Update the dropdown's controlling state
        startReview(newMode); // Call the function to actually start/change the review
    };

    // --- Render Logic ---
    const currentCard = currentReviewDeck[currentCardIndex];
    const currentCardProg = currentCard ? cardProgress[currentCard.id] : null;
    const canNavigate = currentReviewDeck.length > 0;

    return (
        <div className={styles.container}>
            <Head>
                {/* ... (Head content remains the same) ... */}
                <title>CRISC Flashcards</title>
                <meta name="description" content="Flashcard study tool for CRISC terms" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>CRISC Flashcards</h1>

                <div className={styles.modeSelection}>
                    <label htmlFor="mode">Mode:</label>
                    {/* Make the select element controlled */}
                    <select
                        id="mode"
                        value={selectedDropdownMode} // <-- BIND to state
                        onChange={handleModeChange} // <-- Use dedicated handler
                    >
                        {/* Note: The "disabled" prevents user from re-selecting placeholder */}
                        {/* but programmatic setting to 'none' is still needed */}
                        <option value="none" disabled={selectedDropdownMode !== 'none'}>
                            -- Select Mode --
                        </option>
                        <option value="full">Full Deck Review</option>
                        <option value="srs">SRS (Due Cards)</option>
                    </select>
                </div>

                {/* ... (Rest of the JSX remains the same) ... */}
                 <div className={styles.statusBar}>
                    <span>{reviewMessage}</span>
                    <span>Total Cards: {allCardsData.length}</span>
                 </div>


                <div className={styles.controls}>
                     <button onClick={shuffleCurrent} disabled={!canNavigate || currentReviewDeck.length < 2} className={styles.shuffleBtn}>Shuffle Deck</button>
                     <button onClick={resetAllProgressConfirm} disabled={!isClient} className={styles.resetBtn}>Reset All Progress</button>
                </div>

                {isLoading && <p>Loading progress...</p>}

                {!isLoading && currentMode !== 'none' && (
                    <>
                        <div className={styles.progressIndicator}>
                            {canNavigate ? `Card ${currentCardIndex + 1} of ${currentReviewDeck.length}` : 'No cards in current review.'}
                        </div>

                        {currentCard ? (
                            <Flashcard
                                card={currentCard}
                                progress={currentCardProg}
                                onFeedback={handleFeedback}
                            />
                        ) : (
                             <div className={styles.flashcardContainer}>
                                <div className={styles.cardFace} style={{ justifyContent: 'center' }}>
                                    {reviewMessage.includes("Complete") || reviewMessage.includes("No cards") ? reviewMessage : "Loading..."}
                                </div>
                            </div>
                        )}


                        <div className={styles.navigation}>
                            <button onClick={showPrevCard} disabled={!canNavigate || currentCardIndex === 0}>
                                Previous
                            </button>
                            <button onClick={showNextCard} disabled={!canNavigate || currentCardIndex === currentReviewDeck.length - 1}>
                                Next
                            </button>
                        </div>
                    </>
                )}
                 {!isLoading && currentMode === 'none' && (
                     <p style={{marginTop: '2rem'}}>Please select a review mode above to begin studying.</p>
                 )}
            </main>
        </div>
    );
}

// --- Data Fetching ---
export async function getStaticProps() {
    // ... (getStaticProps remains the same) ...
    const dataFilePath = path.join(process.cwd(), 'data', 'flashcards.json');
    let allCardsData = [];

    try {
        const jsonData = fs.readFileSync(dataFilePath, 'utf8');
        allCardsData = JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading or parsing flashcards.json:", error);
    }

    return {
        props: {
            allCardsData,
        },
    };
}
