import React, { useState, useRef, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterPanel, { FilterOptions } from './FilterPanel';
import SearchResults from './SearchResults';
import { Card } from '../types/flashcard';

interface SearchSectionProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    searchResults: Card[];
    totalCards: number;
    onCardSelect: (card: Card) => void;
    highlightText: (text: string, query: string) => string;
    className?: string;
    disabled?: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({
    searchQuery,
    onSearchChange,
    filters,
    onFiltersChange,
    searchResults,
    totalCards,
    onCardSelect,
    highlightText,
    className = "",
    disabled = false
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show results when there's a search query
    useEffect(() => {
        setShowResults(searchQuery.trim().length > 0);
    }, [searchQuery]);

    const handleSearchFocus = () => {
        if (searchQuery.trim()) {
            setShowResults(true);
        }
    };

    const handleCardSelect = (card: Card) => {
        onCardSelect(card);
        setShowResults(false);
        onSearchChange(''); // Clear search after selection
    };

    const hasActiveFilters = filters.difficulty !== 'all' || 
                           filters.recentlyReviewed !== 'all' || 
                           filters.searchIn !== 'both';

    return (
        <div ref={searchContainerRef} className={`relative ${className}`}>
            <div className="flex items-center gap-3 w-full">
                {/* Search Bar */}
                <div className="flex-1">
                    <SearchBar
                        value={searchQuery}
                        onChange={onSearchChange}
                        placeholder="Search terms or definitions..."
                        onFocus={handleSearchFocus}
                        disabled={disabled}
                    />
                </div>

                {/* Filter Panel */}
                <div className="relative">
                    <FilterPanel
                        filters={filters}
                        onChange={onFiltersChange}
                        isOpen={isFilterOpen}
                        onToggle={() => setIsFilterOpen(!isFilterOpen)}
                    />
                </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20">
                    <SearchResults
                        results={searchResults}
                        totalCards={totalCards}
                        searchQuery={searchQuery}
                        onCardSelect={handleCardSelect}
                        highlightText={highlightText}
                    />
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    
                    {filters.difficulty !== 'all' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {filters.difficulty.replace('box', 'Box ')}
                            <button
                                onClick={() => onFiltersChange({ ...filters, difficulty: 'all' })}
                                className="ml-1 hover:text-blue-600 focus:outline-none"
                                aria-label="Remove difficulty filter"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    
                    {filters.recentlyReviewed !== 'all' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            {filters.recentlyReviewed === 'today' ? 'Today' : 
                             filters.recentlyReviewed === 'week' ? 'This Week' : 'Never Reviewed'}
                            <button
                                onClick={() => onFiltersChange({ ...filters, recentlyReviewed: 'all' })}
                                className="ml-1 hover:text-green-600 focus:outline-none"
                                aria-label="Remove review filter"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    
                    {filters.searchIn !== 'both' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            {filters.searchIn === 'terms' ? 'Terms Only' : 'Definitions Only'}
                            <button
                                onClick={() => onFiltersChange({ ...filters, searchIn: 'both' })}
                                className="ml-1 hover:text-purple-600 focus:outline-none"
                                aria-label="Remove search scope filter"
                            >
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Search Statistics */}
            {(searchQuery.trim() || hasActiveFilters) && (
                <div className="mt-2 text-sm text-gray-500">
                    {searchResults.length} of {totalCards} cards match your criteria
                    {searchResults.length !== totalCards && (
                        <button
                            onClick={() => {
                                onSearchChange('');
                                onFiltersChange({
                                    difficulty: 'all',
                                    recentlyReviewed: 'all',
                                    searchIn: 'both'
                                });
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchSection;