import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
}

export function errorHandler(
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(`[Error] ${req.method} ${req.path}:`, err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: {
            message,
            code: err.code,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
    });
}

// Custom error classes
export class BadRequestError extends Error implements ApiError {
    statusCode = 400;
    code = "BAD_REQUEST";

    constructor(message: string) {
        super(message);
        this.name = "BadRequestError";
    }
}

export class UnauthorizedError extends Error implements ApiError {
    statusCode = 401;
    code = "UNAUTHORIZED";

    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export class ForbiddenError extends Error implements ApiError {
    statusCode = 403;
    code = "FORBIDDEN";

    constructor(message = "Forbidden") {
        super(message);
        this.name = "ForbiddenError";
    }
}

export class NotFoundError extends Error implements ApiError {
    statusCode = 404;
    code = "NOT_FOUND";

    constructor(message = "Resource not found") {
        super(message);
        this.name = "NotFoundError";
    }
}

export class ConflictError extends Error implements ApiError {
    statusCode = 409;
    code = "CONFLICT";

    constructor(message: string) {
        super(message);
        this.name = "ConflictError";
    }
}

export class InsufficientCreditsError extends Error implements ApiError {
    statusCode = 402;
    code = "INSUFFICIENT_CREDITS";

    constructor(required: number, available: number) {
        super(`Insufficient credits. Required: ${required}, Available: ${available}`);
        this.name = "InsufficientCreditsError";
    }
}

export class RateLimitError extends Error implements ApiError {
    statusCode = 429;
    code = "RATE_LIMIT_EXCEEDED";

    constructor(retryAfter?: number) {
        super(retryAfter
            ? `Rate limit exceeded. Retry after ${retryAfter} seconds.`
            : "Rate limit exceeded. Please try again later."
        );
        this.name = "RateLimitError";
    }
}
