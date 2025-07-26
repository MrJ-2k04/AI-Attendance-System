// Load environment variables first, before any other imports
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// Use dynamic imports for modules that depend on environment variables
import express from 'express';

var reconnect = null;

// ################################################### CONTROL PANEL ###################################################

initializeServer();

// ################################################### SERVER ###################################################

async function initializeServer() {
  // Dynamic imports to ensure environment variables are loaded first
  const { APP_PORT } = await import('./config.js');
  const { connectToDb } = await import('./db/index.js');
  const setupMiddlewares = (await import('./middlewares/index.js')).default;
  const setupRoutes = (await import('./routes/index.js')).default;

  // Database connection
  connectToDb((err) => {
    // Reconnection logic
    if (err) {
      console.error(err.message, "Reconnecting in 5 seconds...");
      reconnect = setTimeout(initializeServer, 5000);
      return;
    }
    clearTimeout(reconnect);

    // Setup Express App
    const app = express();
    setupMiddlewares(app);
    setupRoutes(app);

    // Start the Server
    app.listen(APP_PORT, () => console.log(`Server started on port ${APP_PORT}`));
  })
}
