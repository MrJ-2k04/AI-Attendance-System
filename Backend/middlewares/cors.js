// Backend/middlewares/cors.js

const corsMiddleware = ({ origin = "*", methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }) => (req, res, next) => {
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", methods.join(", "));
  next();
};

export default corsMiddleware;

