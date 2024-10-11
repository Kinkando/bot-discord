import { AppConfig } from './app';
import { DiscordConfig } from './discord';
import dotenv from 'dotenv';
dotenv.config();

export type Config = {
    readonly app: AppConfig;
    readonly discord: DiscordConfig;
}

export const config: Config = {
    app: {
        port: Number(process.env.PORT || process.env.APP_PORT) || 3000,
        host: process.env.APP_HOST!,
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN!,
        applicationID: process.env.DISCORD_APPLICATION_ID!,
        guildID: process.env.DISCORD_GUILD_ID!,
    },
}
