import axios, { HttpStatusCode } from 'axios';
import express, { Request, Response } from 'express';
import { schedule } from 'node-cron';
import { config } from '../config/config';
import { closeRedisConnection, newRedisConnection } from './database/redis';
import { closeMongoConnection, newMongoConnection } from './database/mongo';
import { newDiscord } from './discord/discord';
import { DiscordService } from './service/discord';
import { DiscordRepository } from './repository/discord';
import { ImageGenerationAIRepository } from './repository/image_generation_ai';
import { ImageGenerationAIService } from './service/image_generation_ai';

async function init() {
    const redisClient = await newRedisConnection();

    const mongoDB = await newMongoConnection();

    const imageGenerationAIRepository = new ImageGenerationAIRepository(mongoDB);

    const discordRepository = new DiscordRepository(redisClient);

    const discordService = new DiscordService(discordRepository);

    const imageGenerationAIService = new ImageGenerationAIService(imageGenerationAIRepository);

    await discordService.syncAudioToLocal();

    const app = express();

    await newDiscord(discordService, imageGenerationAIService);

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
        await closeMongoConnection();
        process.exit(0);
    }

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
}

init();
