import express from 'express';
import { corsMiddleware } from './middleware/cors.js';


// Create Express app
const app = express();

// Middleware
app.use(corsMiddleware);




export { app };
