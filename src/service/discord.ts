import axios from "axios";
import * as fs from 'fs';
import { extname } from "path";
import { v7 } from "uuid";
import { DiscordRepository } from "../repository/discord";
import { VoiceChannelAudio } from "../types/discord";
import { random } from "../util/random";
import { Map } from "../types/map";

export interface Service {
    getVoiceChannelAudio(userID: string): Promise<VoiceChannelAudio | undefined>
    getVoiceChannelAudios(userID: string): Promise<VoiceChannelAudio[]>
    addVoiceChannelAudio(userID: string, url: string, repeatTime: number): Promise<void>
    removeVoiceChannelAudio(userID: string, id: string): Promise<void>
    clearVoiceChannelAudio(userID: string): Promise<void>
    syncAudioToLocal(): Promise<void>
    getLocalPath(voice: VoiceChannelAudio): string

    getVoiceChannelAudioStatus(userID: string): Promise<Map<'ENABLED' | 'DISABLED'>>
    setVoiceChannelAudioStatus(userID: string, channelID: string, status: 'ENABLED' | 'DISABLED'): Promise<void>
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

    async getVoiceChannelAudios(userID: string): Promise<VoiceChannelAudio[]> {
        try {
            return await this.discordRepository.getVoiceChannelAudios(userID);

        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async addVoiceChannelAudio(userID: string, url: string, repeatTime: number = 1): Promise<void> {
        const id = `${v7()}`.replace(/-/g, '');
        await this.saveRemoteFile(id, url);
        await this.discordRepository.addVoiceChannelAudio(userID, { id, url, repeatTime });
    }

    async removeVoiceChannelAudio(userID: string, id: string): Promise<void> {
        await this.discordRepository.removeVoiceChannelAudio(userID, id);
    }

    async clearVoiceChannelAudio(userID: string): Promise<void> {
        await this.discordRepository.clearVoiceChannelAudio(userID);
    }

    async syncAudioToLocal(): Promise<void> {
        const audios = await this.discordRepository.getAllVoiceChannelAudios();
        await Promise.all(Object.keys(audios).flatMap(userID => audios[userID].map(async (audio) => await this.saveRemoteFile(audio.id, audio.url))));
    }

    async getVoiceChannelAudioStatus(userID: string): Promise<Map<'ENABLED' | 'DISABLED'>> {
        return this.discordRepository.getVoiceChannelAudioStatus(userID);
    }

    async setVoiceChannelAudioStatus(userID: string, channelID: string, status: 'ENABLED' | 'DISABLED'): Promise<void> {
        return this.discordRepository.setVoiceChannelAudioStatus(userID, channelID, status);
    }

    getLocalPath(voice: VoiceChannelAudio): string {
        const extension = extname(new URL(voice.url).pathname);
        const path = `assets/${voice.id}${extension}`;
        return path;
    }

    async saveRemoteFile(id: string, url: string): Promise<string> {
        const path = this.getLocalPath({ id, url })
        if (!fs.existsSync(path)) {
            const response = await axios.get(url, { responseType: 'stream' });
            const writer = fs.createWriteStream(path);
            response.data.pipe(writer);
        }
        return path;
    }
}
