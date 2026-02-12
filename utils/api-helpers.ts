/**
 * API Helper Utilities
 * Common functions for handling API responses and errors
 */

import { APIResponse } from '../services/api';
import { logger } from '../services/logger';

/**
 * Handle API response with consistent error handling
 * Returns true if the response was successful, false otherwise
 */
export function handleAPIResponse<T>(
  response: APIResponse<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: { code: string; message: string }) => void;
    logContext?: string;
  } = {}
): boolean {
  const { onSuccess, onError, logContext = 'API call' } = options;

  if (response.success && response.data) {
    logger.debug(`${logContext} successful`);
    onSuccess?.(response.data);
    return true;
  } else {
    const error = response.error || { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
    
    // Don't log token expiration errors as they're handled automatically
    if (error.code !== 'TOKEN_EXPIRED') {
      logger.warn(`${logContext} failed`, { error });
    }
    
    onError?.(error);
    return false;
  }
}

/**
 * Check if an API error is due to token expiration
 */
export function isTokenExpiredError(error: { code: string; message: string } | undefined): boolean {
  return error?.code === 'TOKEN_EXPIRED';
}

/**
 * Check if an API error is retryable (network errors, server errors, etc.)
 */
export function isRetryableError(error: { code: string; message: string } | undefined): boolean {
  if (!error) return false;
  
  const retryableCodes = [
    'NETWORK_ERROR',
    'HTTP_500',
    'HTTP_502',
    'HTTP_503',
    'HTTP_504',
  ];
  
  return retryableCodes.includes(error.code);
}