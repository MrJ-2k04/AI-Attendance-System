require('dotenv').config({ quiet: true });

const express = require('express');
const { APP_PORT } = require('./config');
const { connectToDb } = require('./db');
var reconnect = null;

// ################################################### CONTROL PANEL ###################################################

initializeServer();

// ################################################### SERVER ###################################################

function initializeServer() {
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
    require("./middlewares")(app);
    require("./routes")(app);

    // Start the Server
    app.listen(APP_PORT, () => console.log(`Server started on port ${APP_PORT}`));
  })
}
