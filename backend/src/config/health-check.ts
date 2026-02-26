import { Express } from 'express';

export function setupHealthCheck(app: Express) {
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });
}
