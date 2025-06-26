import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

interface LoadingStateProps {
    isLoading: boolean;
    message?: string;
    progress?: {
        current: number;
        total: number;
    };
    size?: 'small' | 'medium' | 'large';
    showSpinner?: boolean;
    className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    isLoading,
    message = 'Loading...',
    progress,
    size = 'medium',
    showSpinner = true,
    className = ''
}) => {
    if (!isLoading) return null;

    return (
        <div className={`flex flex-col items-center justify-center space-y-4 p-6 ${className}`} role="status" aria-live="polite">
            {showSpinner && <LoadingSpinner size={size} className="text-blue-600" />}
            
            <div className="text-center space-y-2">
                <p className="text-gray-700 font-medium">{message}</p>
                
                {progress && (
                    <div className="w-64">
                        <ProgressBar
                            current={progress.current}
                            total={progress.total}
                            showPercentage
                            color="blue"
                        />
                    </div>
                )}
            </div>
            
            <span className="sr-only">
                {progress 
                    ? `Loading: ${progress.current} of ${progress.total} completed` 
                    : 'Loading, please wait'
                }
            </span>
        </div>
    );
};

export default LoadingState;