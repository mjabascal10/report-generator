import { app } from './app';
import { initializeDatabase } from './database/connection';
import { initializeRedis } from './services/redis.service';
import {config} from "./config";

async function startServer() {
  try {

    await initializeDatabase();
    // await initializeRedis();

    app.listen(config.server.port, () => {
      console.log(`🚀 Server running at http://localhost:${config.server.port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
