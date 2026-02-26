import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { queueService } from '@report-generator/shared';
import {CreateReportDto} from "../dtos/create-report.dto";
import {ReportParamsDto} from "../dtos/report-params.dto";
import {toReportResponse} from "../mappers/report.mapper";
import {logger} from "@report-generator/shared";


export async function createReport( req: Request<{}, {}, CreateReportDto>,
                                    res: Response,
                                    next: NextFunction) {
    try {
        const { name, requestedBy } = req.body;
        const report = await reportService.createReport({ name, requestedBy });

        logger.info({
                reportId: report.id
            },
            'Report created successfully'
        );

        res.status(201).json(toReportResponse(report));
    } catch (error) {
        next(error);
    }
}

export async function getAllReports(req: Request, res: Response, next: NextFunction) {
    try {
        const reports = await reportService.getAllReports();
        logger.info('Reports fetched successfully');

        res.json(reports.map(toReportResponse));
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
        const unsubscribe = await queueService.subscribeToUpdates((update) => {
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

export async function getReportById(req: Request<ReportParamsDto>,
                                    res: Response,
                                    next: NextFunction) {
    try {
        const report = await reportService.getReportById(req.params.id);

        logger.info(
            { id: report.id,  },
            'Report fetched successfully'
        );

        res.json(toReportResponse(report));
    } catch (error) {
        next(error);
    }
}
