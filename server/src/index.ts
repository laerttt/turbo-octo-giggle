import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import invoiceRouter from './routes/invoice';
import analyticsRouter from './routes/analytics';

async function bootstrap() {
    await initDb();

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Note: matches your front-end fetch('/api/invoice', …)
    app.use('/api/analytics', analyticsRouter);
    app.use('/api/invoice', invoiceRouter);

    const port = Number(process.env.PORT) || 4000;
    app.listen(port, () =>
        console.log(`🚀 Backend listening on http://localhost:${port}`)
    );
}

bootstrap().catch(err => {
    console.error('❌ Failed to start', err);
    process.exit(1);
});
