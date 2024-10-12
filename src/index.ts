import axios, { HttpStatusCode } from 'axios';
import express, { Request, Response } from 'express';
import { schedule } from 'node-cron';
import { newDiscord } from './discord/discord';
import { closeRedisConnection, newRedisConnection } from './database/redis';
import { DiscordRepository } from './repository/discord';
import { config, resolveConfig } from './config/config';

async function init() {
    await resolveConfig();

    const redisClient = await newRedisConnection();

    const discordRepository = new DiscordRepository(redisClient);

    const app = express();

    await newDiscord(discordRepository);

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

    const gracefulShutdown = async (signal: string) => {
        await closeRedisConnection(redisClient);
        process.exit(0);
    }

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
}

init();
