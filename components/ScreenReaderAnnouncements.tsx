import React, { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncementsProps {
    message: string;
    priority?: 'polite' | 'assertive';
}

const ScreenReaderAnnouncements: React.FC<ScreenReaderAnnouncementsProps> = ({ 
    message, 
    priority = 'polite' 
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && message) {
            // Clear previous message
            ref.current.textContent = '';
            
            // Add new message after a brief delay to ensure it's announced
            setTimeout(() => {
                if (ref.current) {
                    ref.current.textContent = message;
                }
            }, 100);
        }
    }, [message]);

    return (
        <div
            ref={ref}
            className="sr-only"
            aria-live={priority}
            aria-atomic="true"
            role="status"
        />
    );
};

export default ScreenReaderAnnouncements;