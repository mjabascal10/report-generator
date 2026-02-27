import { Request, Response, NextFunction } from 'express';
import {logger} from "@report-generator/shared";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error(
        {
            message: err.message,
            stack: err.stack,
            method: req.method,
            path: req.path,
            body: req.body,
            params: req.params,
            query: req.query,
        },
        'Unhandled exception'
    );

    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
}
