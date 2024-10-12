import axios, { HttpStatusCode } from 'axios';
import express, { Request, Response } from 'express';
import { schedule } from 'node-cron';
import { client } from './discord/discord';
import { config, resolveConfig } from '../config/config';

async function init() {
    await resolveConfig();

    const app = express();

    client.login(config.discord.botToken);

    app.get('/health', (req: Request, res: Response) => {
            res.status(HttpStatusCode.Ok).json({ message: 'OK' });
    });

    app.get('/livez', (req: Request, res: Response) => {
            res.status(HttpStatusCode.Ok).json({ message: 'OK' });
    });

    app.get('/readyz', (req: Request, res: Response) => {
            res.status(HttpStatusCode.Ok).json({ message: 'OK' });
    });

    app.listen(config.app.port, () => {
            console.log(`Server running at http://localhost:${config.app.port}`);
    });

    schedule('* * * * *', async () => {
            await axios.get(`${config.app.host}/health`)
    });
}

init();
