
const express = require('express');
const path = require('path');
const cors = require('./cors');
const timeoutMiddleware = require('./requestTimeout');
const multerMiddleware = require("./multer");

module.exports = function (app) {
    app.use(express.static(path.join(__dirname, '../', 'uploads')));
    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(timeoutMiddleware(5000)); // 5 seconds
    app.use(multerMiddleware([]));
}