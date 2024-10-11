import { DiscordConfig } from './discord';
import dotenv from 'dotenv';
dotenv.config();

export type Config = {
    readonly discord: DiscordConfig;
}

export const config: Config = {
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN!,
        applicationID: process.env.DISCORD_APPLICATION_ID!,
        guildID: process.env.DISCORD_GUILD_ID!,
    },
}
