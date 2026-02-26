import { bootstrap, setupShutdownHandlers } from './bootstrap';

// Setup graceful shutdown handlers
setupShutdownHandlers();

// Start the server
bootstrap();
