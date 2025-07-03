import { ZodError } from 'zod';

export interface ValidationErrorResponse {
  error: string;
  message: string;
  details?: string[];
  status_code: number;
}

/**
 * Format Zod validation errors into user-friendly messages
 */
export function formatValidationErrors(error: ZodError): ValidationErrorResponse {
  const fieldErrors = error.flatten().fieldErrors;
  const formErrors = error.flatten().formErrors;
  
  // Collect all error messages
  const errorMessages: string[] = [];
  
  // Add form-level errors
  if (formErrors.length > 0) {
    errorMessages.push(...formErrors);
  }
  
  // Add field-level errors
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      errorMessages.push(...messages);
    }
  }
  
  // Create user-friendly message
  let message: string;
  if (errorMessages.length === 1) {
    message = errorMessages[0]!;
  } else if (errorMessages.length > 1) {
    message = `Please fix the following errors: ${errorMessages.join(', ')}`;
  } else {
    message = 'Invalid input data';
  }
  
  const response: ValidationErrorResponse = {
    error: 'Validation Error',
    message,
    status_code: 400,
  };
  
  if (errorMessages.length > 1) {
    response.details = errorMessages;
  }
  
  return response;
} 