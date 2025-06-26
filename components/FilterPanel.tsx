import React from 'react';

export interface FilterOptions {
    difficulty: 'all' | 'box1' | 'box2' | 'box3' | 'box4' | 'box5';
    recentlyReviewed: 'all' | 'today' | 'week' | 'never';
    searchIn: 'both' | 'terms' | 'definitions';
}

interface FilterPanelProps {
    filters: FilterOptions;
    onChange: (filters: FilterOptions) => void;
    className?: string;
    isOpen: boolean;
    onToggle: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    onChange,
    className = "",
    isOpen,
    onToggle
}) => {
    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        onChange({
            ...filters,
            [key]: value
        });
    };

    const resetFilters = () => {
        onChange({
            difficulty: 'all',
            recentlyReviewed: 'all',
            searchIn: 'both'
        });
    };

    const hasActiveFilters = filters.difficulty !== 'all' || 
                           filters.recentlyReviewed !== 'all' || 
                           filters.searchIn !== 'both';

    return (
        <div className={className}>
            {/* Filter Toggle Button */}
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    hasActiveFilters 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                aria-expanded={isOpen}
                aria-controls="filter-panel"
                aria-label={`${isOpen ? 'Hide' : 'Show'} filter options`}
            >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                </svg>
                Filters
                {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-600 rounded-full" aria-label="Active filters">
                        <span className="sr-only">Active filters applied</span>
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <div
                    id="filter-panel"
                    className="absolute z-10 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4"
                    role="region"
                    aria-label="Filter options"
                >
                    {/* Difficulty Filter */}
                    <div>
                        <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty Level
                        </label>
                        <select
                            id="difficulty-filter"
                            value={filters.difficulty}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Levels</option>
                            <option value="box1">Box 1 (Learning)</option>
                            <option value="box2">Box 2 (Progressing)</option>
                            <option value="box3">Box 3 (Improving)</option>
                            <option value="box4">Box 4 (Almost Mastered)</option>
                            <option value="box5">Box 5 (Mastered)</option>
                        </select>
                    </div>

                    {/* Recently Reviewed Filter */}
                    <div>
                        <label htmlFor="recent-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Recently Reviewed
                        </label>
                        <select
                            id="recent-filter"
                            value={filters.recentlyReviewed}
                            onChange={(e) => handleFilterChange('recentlyReviewed', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Cards</option>
                            <option value="today">Reviewed Today</option>
                            <option value="week">Reviewed This Week</option>
                            <option value="never">Never Reviewed</option>
                        </select>
                    </div>

                    {/* Search In Filter */}
                    <div>
                        <label htmlFor="search-in-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Search In
                        </label>
                        <select
                            id="search-in-filter"
                            value={filters.searchIn}
                            onChange={(e) => handleFilterChange('searchIn', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="both">Terms and Definitions</option>
                            <option value="terms">Terms Only</option>
                            <option value="definitions">Definitions Only</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-2">
                        <button
                            onClick={resetFilters}
                            disabled={!hasActiveFilters}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={onToggle}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;