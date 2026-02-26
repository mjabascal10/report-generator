import { Application } from 'express';
import cors from 'cors';
import express from 'express';

export function setupMiddleware(app: Application) {
    app.use(cors());
    app.use(express.json());
}
