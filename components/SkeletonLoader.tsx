import React from 'react';

interface SkeletonLoaderProps {
    className?: string;
    width?: string;
    height?: string;
    variant?: 'text' | 'rectangular' | 'circular';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    className = '',
    width = 'w-full',
    height = 'h-4',
    variant = 'rectangular'
}) => {
    const baseClasses = 'animate-pulse bg-gray-200 motion-reduce:animate-none';
    
    const variantClasses = {
        text: 'rounded',
        rectangular: 'rounded',
        circular: 'rounded-full'
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
            role="status"
            aria-label="Loading content"
        >
            <span className="sr-only">Loading content...</span>
        </div>
    );
};

export default SkeletonLoader;