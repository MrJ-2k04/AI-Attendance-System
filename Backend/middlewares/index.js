
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from './cors.js';
import timeoutMiddleware from './requestTimeout.js';
import multerMiddleware from "./multer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (app) {
    app.use(express.static(path.join(__dirname, '../', 'uploads')));
    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(timeoutMiddleware(5000)); // 5 seconds
    app.use(multerMiddleware([]));
}