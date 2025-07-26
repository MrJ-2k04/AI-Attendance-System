import ResponseHandler from "../utils/ResponseHandler.js";

// Custom timeout middleware
const timeoutMiddleware = (timeoutMillis = 5000) => (req, res, next) => {
    const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
            // Handle timeout
            return ResponseHandler.requestTimeout(res);
        }
    }, timeoutMillis);

    // Set the timeout ID on the request object for potential cancellation
    req.timeoutId = timeoutId;

    // Continue to the next middleware/route handler
    next();
};

export default timeoutMiddleware;