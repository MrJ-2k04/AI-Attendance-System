
const { connect } = require('mongoose');
const { DB_CONNECTION_URL } = require('../config');

const connectionOptions = {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
}

module.exports = {
    connectToDb: (callback) => {
        connect(DB_CONNECTION_URL, connectionOptions)
            .then(conn => {
                console.log("Connected to MongoDB Successfully!");
                return callback()
            })
            .catch(err => {
                return callback(err)
            })
    },
}