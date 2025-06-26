import React from 'react';

interface ErrorMessageProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
    title = "Error",
    message,
    onRetry,
    onDismiss
}) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">{title}</h3>
                    <p className="mt-1 text-sm text-red-700">{message}</p>
                    {(onRetry || onDismiss) && (
                        <div className="mt-3 flex space-x-2">
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;