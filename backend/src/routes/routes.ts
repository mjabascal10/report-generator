import { Router } from 'express';
import {
  createReport,
  getAllReports,
  streamReports,
  getReportById
} from '../controllers/report.controller';

const router = Router();

router.post('/', createReport);
router.get('/', getAllReports);
router.get('/stream', streamReports);
router.get('/:id', getReportById);

export default router;
