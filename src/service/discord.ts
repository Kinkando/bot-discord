import axios from "axios";
import { createWriteStream, existsSync } from "fs";
import { extname } from "path";
import { v7 } from "uuid";
import { DiscordRepository } from "../repository/discord";
import { VoiceChannelAudio } from "../types/discord";
import { random } from "../util/random";

export interface Service {
    getVoiceChannelAudio(userID: string): Promise<VoiceChannelAudio | undefined>
    addVoiceChannelAudio(userID: string, url: string, repeatTime: number): Promise<void>
    syncAudioToLocal(): Promise<void>
    getLocalPath(voice: VoiceChannelAudio): string
}

export class DiscordService implements Service {
    constructor(private readonly discordRepository: DiscordRepository) {}

    async getVoiceChannelAudio(userID: string): Promise<VoiceChannelAudio | undefined> {
        try {
            const voices = await this.discordRepository.getVoiceChannelAudios(userID);
            if (!voices || !voices.length) {
                return;
            }
            const index = random(voices.length) - 1;
            return voices[index];

        } catch (error) {
            console.error(error);
        }
    }

    async addVoiceChannelAudio(userID: string, url: string, repeatTime: number = 1): Promise<void> {
        const id = `${v7()}`.replace(/-/g, '');
        await this.discordRepository.addVoiceChannelAudio(userID, { id, url, repeatTime });
        await this.saveRemoteFile(id, url);
    }

    async syncAudioToLocal(): Promise<void> {
        const audios = await this.discordRepository.getAllVoiceChannelAudios();
        for (const userID of Object.keys(audios)) {
            for (const audio of audios[userID]) {
                await this.saveRemoteFile(audio.id, audio.url);
            }
        }
    }

    getLocalPath(voice: VoiceChannelAudio): string {
        const extension = extname(new URL(voice.url).pathname);
        const path = `assets/${voice.id}${extension}`;
        return path;
    }

    async saveRemoteFile(id: string, url: string): Promise<string> {
        const path = this.getLocalPath({ id, url })
        if (!existsSync(path)) {
            const response = await axios.get(url, { responseType: 'stream' });
            const writer = createWriteStream(path);
            response.data.pipe(writer);
        }
        return path;
    }
}
