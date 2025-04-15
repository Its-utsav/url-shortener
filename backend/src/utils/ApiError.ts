export default class ApiError extends Error {
    message: string;
    readonly statusCode: number;
    readonly success: boolean = false;
    readonly errors?: string[];
    readonly errorStack?: string | undefined;
    constructor(
        statusCode: number,
        message: string = "Something Went wrong",
        errors: string[] = [],
        errorStack: string = ""
    ) {
        super(message);

        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = this.constructor.name;

        if (errorStack) {
            this.errorStack = errorStack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
