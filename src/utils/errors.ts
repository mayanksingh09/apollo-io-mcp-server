export class ApolloError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApolloError";
  }
}

export class RateLimitError extends ApolloError {
  constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, { retryAfter });
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends ApolloError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTHENTICATION_FAILED", 401);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends ApolloError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApolloError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}
