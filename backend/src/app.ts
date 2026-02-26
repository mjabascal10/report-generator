import express from 'express';
import {setupMiddleware} from "./middlewares";
import routes from "./routes/routes";
import {setupHealthCheck} from "./middlewares/health-check";

export const app = express();

setupMiddleware(app);

app.use('/reports', routes);

setupHealthCheck(app);
