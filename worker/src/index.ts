import { bootstrap, setupShutdownHandlers } from './bootstrap';
import {logger} from "@report-generator/shared";

setupShutdownHandlers();

bootstrap().catch((error) => {
  logger.error(error);
  process.exit(1);
});
