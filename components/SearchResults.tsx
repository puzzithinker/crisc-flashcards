import React from 'react';
import { Card } from '../types/flashcard';

interface SearchResultsProps {
    results: Card[];
    totalCards: number;
    searchQuery: string;
    onCardSelect: (card: Card) => void;
    highlightText: (text: string, query: string) => string;
    className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    totalCards,
    searchQuery,
    onCardSelect,
    highlightText,
    className = ""
}) => {
    if (!searchQuery.trim()) {
        return null;
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto ${className}`}>
            {/* Results Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">
                        Search Results
                    </h3>
                    <span className="text-sm text-gray-500">
                        {results.length} of {totalCards} cards
                    </span>
                </div>
            </div>

            {/* Results List */}
            <div role="listbox" aria-label="Search results">
                {results.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-6h3m-6 0h.01M12 18h.01"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Try adjusting your search terms or filters.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {results.map((card) => (
                            <li key={card.id}>
                                <button
                                    onClick={() => onCardSelect(card)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                                    role="option"
                                    aria-selected="false"
                                    aria-label={`Select flashcard: ${card.term}`}
                                >
                                    <div className="space-y-1">
                                        {/* Term */}
                                        <div className="text-sm font-medium text-gray-900">
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightText(card.term, searchQuery)
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Definition (truncated) */}
                                        <div className="text-xs text-gray-500 line-clamp-2">
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightText(
                                                        card.definition.length > 100 
                                                            ? card.definition.slice(0, 100) + '...'
                                                            : card.definition,
                                                        searchQuery
                                                    )
                                                }}
                                            />
                                        </div>

                                        {/* Card ID for reference */}
                                        <div className="text-xs text-gray-400">
                                            Card #{card.id}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer with action hint */}
            {results.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500">
                        Click on a card to start studying from that point
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;