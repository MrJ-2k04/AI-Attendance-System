

function logToFile() {
    const { format } = require('util');
    const fs = require('fs');
    const path = require('path');
    const logDirectory = path.join(__dirname, 'logs');

    // Create log directory if it doesn't exist
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    const logFile = fs.createWriteStream(logDirectory + '/logs.txt', { flags: 'a' })
        , errorFile = fs.createWriteStream(logDirectory + '/error_logs.txt', { flags: 'a' });

    // Logging format for files
    const formatMsg = args => `${new Date().toLocaleString("IN", { hour12: true })}-\t${format.apply(null, args)}\n`;


    // Function Overriding
    console.log = (...args) => {
        const formattedMsg = formatMsg(args);
        logFile.write(formattedMsg);
        process.stdout.write(formattedMsg);
    };

    console.error = (...args) => {
        const formattedMsg = formatMsg(args);
        errorFile.write(formattedMsg);
        process.stderr.write(formattedMsg);
    };

    console.info = console.log;
}

console.log("Logger initialized");

if (process.env.NODE_ENV === 'production') {
  logToFile();  // Logs to file instead of terminal in Production mode
}
