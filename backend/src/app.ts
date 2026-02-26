import express from 'express';
import {setupMiddleware} from "./middlewares";
import routes from "./routes/routes";
import {setupHealthCheck} from "./config/health-check";
import {errorHandler} from "./middlewares/error.middleware";

export const app = express();

setupMiddleware(app);

app.use('/api/reports', routes);

setupHealthCheck(app);

app.use(errorHandler);
