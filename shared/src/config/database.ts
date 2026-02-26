import { Sequelize } from 'sequelize';
import { logger } from '../logger';

let sequelizeInstance: Sequelize | null = null;

/**
 * Initialize database connection
 * Returns singleton instance
 */
export async function initializeDatabase(): Promise<Sequelize> {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  const dbHost = process.env.DATABASE_HOST || 'localhost';
  const dbPort = parseInt(process.env.DATABASE_PORT || '5432');
  const dbName = process.env.DATABASE_NAME || 'report_generator';
  const dbUser = process.env.DATABASE_USER || 'postgres';
  const dbPassword = process.env.DATABASE_PASSWORD || 'postgres';

  sequelizeInstance = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  try {
    await sequelizeInstance.authenticate();
    logger.info('Database connection established');
    return sequelizeInstance;
  } catch (error) {
    logger.error({ error }, 'Failed to authenticate with database');
    throw error;
  }
}

export function getDatabase(): Sequelize {
  if (!sequelizeInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return sequelizeInstance;
}
