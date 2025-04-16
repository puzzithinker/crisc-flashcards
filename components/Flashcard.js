// components/Flashcard.js
import React, { useState } from 'react';
import styles from '../styles/Home.module.css'; // Use styles from Home module

const Flashcard = ({ card, progress, onFeedback }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!card) {
        return <div className={styles.flashcardContainer}>Loading card...</div>;
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleFeedbackClick = (easy) => {
        onFeedback(card.id, easy);
        setIsFlipped(false); // Flip back to front after feedback
    };

    return (
        <div className={styles.flashcardContainer}>
            <div
                className={`${styles.flashcard} ${isFlipped ? styles.isFlipped : ''}`}
                onClick={handleFlip} // Flip on click
            >
                <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    {card.term}
                </div>
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                    <p>{card.definition}</p>
                    {/* Feedback buttons shown only on back */}
                    <div className={styles.feedback} style={{ marginTop: '20px' }}>
                        <button
                            className={`${styles.feedbackBtn} ${styles.hard}`}
                            onClick={(e) => { e.stopPropagation(); handleFeedbackClick(false); }} // Prevent flip on button click
                        >
                            Review Again (Hard)
                        </button>
                        <button
                            className={`${styles.feedbackBtn} ${styles.easy}`}
                            onClick={(e) => { e.stopPropagation(); handleFeedbackClick(true); }} // Prevent flip on button click
                        >
                            Got it! (Easy)
                        </button>
                    </div>
                     <div className={styles.cardBoxInfoSmall}>
                        Box: {progress?.box ?? 1}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;
