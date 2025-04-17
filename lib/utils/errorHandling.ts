import { useState } from 'react';

export enum ErrorType {
  Authentication = 'authentication',
  Database = 'database',
  Network = 'network',
  Validation = 'validation',
  Unknown = 'unknown'
}

export interface AppError extends Error {
  type: ErrorType;
  details?: string;
  originalError?: any;
}

export const createAppError = (
  message: string, 
  type: ErrorType = ErrorType.Unknown,
  details?: string,
  originalError?: any
): AppError => {
  const error = new Error(message) as AppError;
  error.type = type;
  error.details = details;
  error.originalError = originalError;
  return error;
};

// Error handling for Supabase operations
export const handleSupabaseError = (error: any): AppError => {
  console.error('Supabase error:', error);
  
  // Determine error type based on error code or message
  let errorType = ErrorType.Unknown;
  
  if (error?.code?.startsWith('auth')) {
    errorType = ErrorType.Authentication;
  } else if (error?.code?.startsWith('22') || error?.code?.startsWith('23')) {
    // PostgreSQL error codes for data validation and integrity
    errorType = ErrorType.Database;
  }
  
  return createAppError(
    error?.message || 'An unexpected error occurred',
    errorType,
    error?.details || error?.hint,
    error
  );
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = (err: any, fallbackMessage = 'An unexpected error occurred') => {
    if (err.type) {
      // Already an AppError
      setError(err);
      return err;
    }
    
    // Check network errors
    if (err instanceof TypeError && err.message.includes('network')) {
      const networkError = createAppError(
        'Network error. Please check your connection.',
        ErrorType.Network,
        err.message,
        err
      );
      setError(networkError);
      return networkError;
    }
    
    // Handle Supabase errors
    if (err.code || err.statusCode || err.status) {
      const supabaseError = handleSupabaseError(err);
      setError(supabaseError);
      return supabaseError;
    }
    
    // Default unknown error
    const unknownError = createAppError(
      err.message || fallbackMessage,
      ErrorType.Unknown,
      undefined,
      err
    );
    setError(unknownError);
    return unknownError;
  };
  
  const clearError = () => {
    setError(null);
  };
  
  return { error, handleError, clearError };
};
