import { initializeDatabase as initDbFromShared, getDatabase } from '@report-generator/shared';
import { logger } from '@report-generator/shared';
import { initializeReportModel } from '../models/report';

export async function initializeDatabase() {
  try {
    const sequelize = await initDbFromShared();

    initializeReportModel();

    await sequelize.sync({ alter: false });
    logger.info('Models synchronized with the database');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize database');
    process.exit(1);
  }
}
