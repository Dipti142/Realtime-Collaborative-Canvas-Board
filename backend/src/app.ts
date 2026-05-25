import express from 'express';
import { corsMiddleware } from './middleware/cors.js';

const app = express();

// Middleware
app.use(corsMiddleware);




export { app };
