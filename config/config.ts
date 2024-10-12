import dotenv from 'dotenv';
import { AppConfig } from './app';
import { DiscordConfig } from './discord';
import { RedisConfig } from './redis';
dotenv.config();

export type Config = {
    readonly app: AppConfig;
    readonly redis: RedisConfig;
    readonly discord: DiscordConfig;
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
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN!,
        applicationID: process.env.DISCORD_APPLICATION_ID!,
        guildID: process.env.DISCORD_GUILD_ID!,
        botID: process.env.DISCORD_BOT_ID!,
    },
}

export {
    config,
}
