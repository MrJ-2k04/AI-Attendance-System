const ResponseHandler = require("../utils/ResponseHandler");

// Custom timeout middleware
const timeoutMiddleware = (timeoutMillis = 5000) => (req, res, next) => {
    const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
            // Handle timeout
            return new ResponseHandler(res).requestTimeout();
        }
    }, timeoutMillis);

    // Set the timeout ID on the request object for potential cancellation
    req.timeoutId = timeoutId;

    // Continue to the next middleware/route handler
    next();
};

module.exports = timeoutMiddleware;