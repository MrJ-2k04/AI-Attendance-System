
import { connect } from 'mongoose';
import { DB_CONNECTION_URL } from '../config.js';

const connectionOptions = {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
}

export const connectToDb = (callback) => {
    connect(DB_CONNECTION_URL, connectionOptions)
        .then(conn => {
            console.log("Connected to MongoDB Successfully!");
            return callback()
        })
        .catch(err => {
            return callback(err)
        })
};