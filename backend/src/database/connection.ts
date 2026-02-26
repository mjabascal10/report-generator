import { Sequelize } from 'sequelize';
import {config} from "../config";

export const sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'postgres',
        logging: config.server.nodeEnv === 'development' ? console.log : false,
        pool: {
            min: 0,
            max: 5,
        },
    }
);

export async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Successfully connected to PostgreSQL');

        await sequelize.sync({ alter: false });
        console.log('Models synchronized with the database');
    } catch (error) {
        console.error('✗ Failed to connect to the database:', error);
        process.exit(1);
    }
}
