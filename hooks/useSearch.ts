import { useState, useMemo, useCallback } from 'react';
import { Card, Progress } from '../types/flashcard';
import { FilterOptions } from '../components/FilterPanel';

interface UseSearchProps {
    cards: Card[];
    cardProgress: Record<number, Progress>;
}

export const useSearch = ({ cards, cardProgress }: UseSearchProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({
        difficulty: 'all',
        recentlyReviewed: 'all',
        searchIn: 'both'
    });

    // Debounced search function
    const normalizeText = useCallback((text: string) => {
        return text.toLowerCase().trim().replace(/\s+/g, ' ');
    }, []);

    const filteredCards = useMemo(() => {
        let result = [...cards];

        // Apply search query filter
        if (searchQuery.trim()) {
            const normalizedQuery = normalizeText(searchQuery);
            const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);

            result = result.filter(card => {
                const searchableText = [];
                
                if (filters.searchIn === 'both' || filters.searchIn === 'terms') {
                    searchableText.push(normalizeText(card.term));
                }
                
                if (filters.searchIn === 'both' || filters.searchIn === 'definitions') {
                    searchableText.push(normalizeText(card.definition));
                }

                const combinedText = searchableText.join(' ');

                // Check if all search terms are found
                return searchTerms.every(term => 
                    combinedText.includes(term)
                );
            });
        }

        // Apply difficulty filter
        if (filters.difficulty !== 'all') {
            const targetBox = parseInt(filters.difficulty.replace('box', ''));
            result = result.filter(card => {
                const progress = cardProgress[card.id];
                return progress?.box === targetBox;
            });
        }

        // Apply recently reviewed filter
        if (filters.recentlyReviewed !== 'all') {
            const now = Date.now();
            const oneDayMs = 24 * 60 * 60 * 1000;
            const oneWeekMs = 7 * oneDayMs;

            result = result.filter(card => {
                const progress = cardProgress[card.id];
                if (!progress) return filters.recentlyReviewed === 'never';

                const timeSinceReview = now - progress.lastReviewed;

                switch (filters.recentlyReviewed) {
                    case 'today':
                        return timeSinceReview <= oneDayMs;
                    case 'week':
                        return timeSinceReview <= oneWeekMs;
                    case 'never':
                        return progress.lastReviewed === 0;
                    default:
                        return true;
                }
            });
        }

        return result;
    }, [cards, cardProgress, searchQuery, filters, normalizeText]);

    // Search statistics
    const searchStats = useMemo(() => {
        return {
            totalCards: cards.length,
            filteredCards: filteredCards.length,
            hasActiveFilters: filters.difficulty !== 'all' || 
                            filters.recentlyReviewed !== 'all' || 
                            filters.searchIn !== 'both',
            hasSearchQuery: searchQuery.trim().length > 0
        };
    }, [cards.length, filteredCards.length, filters, searchQuery]);

    // Highlight search terms in text
    const highlightText = useCallback((text: string, query: string) => {
        if (!query.trim()) return text;

        const normalizedQuery = normalizeText(query);
        const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
        
        let highlightedText = text;
        
        searchTerms.forEach(term => {
            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
        });

        return highlightedText;
    }, [normalizeText]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            difficulty: 'all',
            recentlyReviewed: 'all',
            searchIn: 'both'
        });
    }, []);

    const clearAll = useCallback(() => {
        setSearchQuery('');
        setFilters({
            difficulty: 'all',
            recentlyReviewed: 'all',
            searchIn: 'both'
        });
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        filteredCards,
        searchStats,
        highlightText,
        clearSearch,
        resetFilters,
        clearAll
    };
};