import axios from 'axios';
import dotenv from 'dotenv';
import { createWriteStream, existsSync } from 'fs';
import { AppConfig } from './app';
import { DiscordConfig } from './discord';
dotenv.config();

export type Config = {
    readonly app: AppConfig;
    readonly discord: DiscordConfig;
}

let config!: Config;

export const resolveConfig = async () => {
    let discordVoiceOption = '';
    for (const option of process.env.DISCORD_VOICE_OPTIONS!.split('\n')) {
        const opt = option.split(',');
        if (opt.length < 2) {
            throw Error('invalid config');
        }
        opt[1] = await saveRemoteFile(opt[1]);
        discordVoiceOption += opt.join(',') + '\n';
    }

    config = {
        app: {
            port: Number(process.env.PORT || process.env.APP_PORT) || 3000,
            host: process.env.APP_HOST!,
            userAgent: process.env.APP_USER_AGENT!,
        },
        discord: {
            botToken: process.env.DISCORD_BOT_TOKEN!,
            applicationID: process.env.DISCORD_APPLICATION_ID!,
            guildID: process.env.DISCORD_GUILD_ID!,
            botID: process.env.DISCORD_BOT_ID!,
            defaultVoicePath: await saveRemoteFile(process.env.DISCORD_DEFAULT_VOICE_OPTION_PATH!),
            voices: discordVoiceOption.split('\n').filter(option => option).map((option) => {
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
}

async function saveRemoteFile(url: string): Promise<string> {
    const path = `assets/${url.substring(url.lastIndexOf('/')+1)}`;
    if (!existsSync(path)) {
        const response = await axios.get(url, { responseType: 'stream' });
        const writer = createWriteStream(path);
        response.data.pipe(writer);
    }
    return path;
}

export {
    config,
}
