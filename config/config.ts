import dotenv from 'dotenv';
import { AppConfig } from './app';
import { DiscordConfig } from './discord';
import { RedisConfig } from './redis';
import { ImageGenerationAIConfig } from './image_generation_ai';
import { MongoDBConfig } from './mongo';
dotenv.config();

export type Config = {
    readonly app: AppConfig;
    readonly redis: RedisConfig;
    readonly mongo: MongoDBConfig;
    readonly discord: DiscordConfig;
    readonly imageGenerationAI: ImageGenerationAIConfig;
}

const config: Config = {
    app: {
        port: Number(process.env.PORT || process.env.APP_PORT) || 3000,
        host: process.env.APP_HOST!,
        userAgent: process.env.APP_USER_AGENT!,
    },
    redis: {
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT!),
        username: process.env.REDIS_USERNAME!,
        password: process.env.REDIS_PASSWORD!,
    },
    mongo: {
        scheme: process.env.MONGO_SCHEME!,
        host: process.env.MONGO_HOST!,
        port: process.env.MONGO_PORT ? Number(process.env.MONGO_PORT) : undefined,
        username: process.env.MONGO_USERNAME!,
        password: process.env.MONGO_PASSWORD!,
        database: process.env.MONGO_DATABASE!,
        queryString: process.env.MONGO_QUERY_STRING!,
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN!,
        applicationID: process.env.DISCORD_APPLICATION_ID!,
        guildID: process.env.DISCORD_GUILD_ID!,
        botID: process.env.DISCORD_BOT_ID!,
    },
    imageGenerationAI: {
        baseURL: process.env.IMAGE_GENERATION_AI_BASE_URL!,
    }
}

export {
    config,
}
