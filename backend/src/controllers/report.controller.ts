import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { subscribeToUpdates } from '../services/redis.service';
import {logger} from "../config/logger";

export async function createReport(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, requestedBy } = req.body;
        const report = await reportService.createReport({ name, requestedBy });

        logger.info({
                reportId: report.id
            },
            'Report created successfully'
        );

        res.status(201).json(report);
    } catch (error) {
        next(error);
    }
}

export async function getAllReports(req: Request, res: Response, next: NextFunction) {
    try {
        const reports = await reportService.getAllReports();
        logger.info('Reports fetched successfully');
        
        res.json(reports);
    } catch (error) {
        next(error);
    }
}

export async function streamReports(req: Request, res: Response, next: NextFunction) {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('data: {"type":"connection","message":"SSE connected"}\n\n');

    try {
        const unsubscribe = await subscribeToUpdates((update) => {
            logger.debug(
                { update  },
                'Sending SSE update'
            );
            res.write(`data: ${JSON.stringify(update)}\n\n`);
        });

        req.on('close', async () => {
            logger.info('Client disconnected from SSE stream');
            await unsubscribe();
            res.end();
        });
    } catch (error) {
        next(error);
    }
}

export async function getReportById(req: Request, res: Response, next: NextFunction) {
    try {
        const report = await reportService.getReportById(req.params.id);

        logger.info(
            { id: report.id,  },
            'Report fetched successfully'
        );

        res.json(report);
    } catch (error) {
        next(error);
    }
}
