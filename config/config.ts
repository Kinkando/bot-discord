import { AppConfig } from './app';
import { DiscordConfig } from './discord';
import dotenv from 'dotenv';
dotenv.config();

export type Config = {
    readonly app: AppConfig;
    readonly discord: DiscordConfig;
}

const config: Config = {
    app: {
        port: Number(process.env.PORT || process.env.APP_PORT) || 3000,
        host: process.env.APP_HOST!,
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN!,
        applicationID: process.env.DISCORD_APPLICATION_ID!,
        guildID: process.env.DISCORD_GUILD_ID!,
        botID: process.env.DISCORD_BOT_ID!,
        defaultVoicePath: process.env.DISCORD_DEFAULT_VOICE_OPTION_PATH!,
        voices: process.env.DISCORD_VOICE_OPTIONS!.split('\n').map((option) => {
            const opt = option.split(',');
            const repeatTime = opt.length >= 3 ? Number(opt[2]) : 1;
            return {
                userID: opt[0],
                audio: opt[1],
                repeatTime,
            }
        }),
    },
}

export {
    config,
}
