import { RedisClientType, RedisDefaultModules } from "redis";
import { config } from "../config/config";
import { VoiceChannelAudio } from "../types/discord";
import { Map } from "../types/map";

const prefixKey = `DISCORD`;

interface Repository {
    getAdminIDs(): Promise<string[]>
    setAdminIDs(adminIDs: string[]): Promise<void>

    getAllVoiceChannelAudios(): Promise<Map<VoiceChannelAudio[]>>
    getVoiceChannelAudios(userID: string): Promise<VoiceChannelAudio[]>
    addVoiceChannelAudio(userID: string, req: VoiceChannelAudio): Promise<void>
    removeVoiceChannelAudio(userID: string, id: string): Promise<void>
    clearVoiceChannelAudio(userID: string): Promise<void>

    getVoiceChannelAudioStatus(userID: string): Promise<Map<'ENABLED' | 'DISABLED'>>
    setVoiceChannelAudioStatus(userID: string, channelID: string, status: 'ENABLED' | 'DISABLED'): Promise<void>
}

export class DiscordRepository implements Repository {
    constructor(private db: RedisClientType<RedisDefaultModules>) {}

    async getAdminIDs(): Promise<string[]> {
        const key = `${prefixKey}:ADMIN_ID:${config.discord.applicationID}:${config.discord.guildID}`;
        const result = await this.db.GET(key);
        if (!result) {
            throw Error('admin id not found');
        }
        return JSON.parse(result);
    }

    async setAdminIDs(adminIDs: string[]): Promise<void> {
        const key = `${prefixKey}:ADMIN_ID:${config.discord.applicationID}:${config.discord.guildID}`;
        await this.db.SET(key, JSON.stringify(adminIDs));
    }

    async getAllVoiceChannelAudios(): Promise<Map<VoiceChannelAudio[]>> {
        const key = `${prefixKey}:VOICE_CHANNEL_AUDIO:DETAIL:*:${config.discord.applicationID}:${config.discord.guildID}`;
        const keys = await this.db.KEYS(key);
        const result: Map<VoiceChannelAudio[]> = {};
        for (const k of keys) {
            const userID = k.split(':')[3];
            result[userID] = await this.getVoiceChannelAudios(userID);
        }
        return result;
    }

    async getVoiceChannelAudios(userID: string): Promise<VoiceChannelAudio[]> {
        const key = `${prefixKey}:VOICE_CHANNEL_AUDIO:DETAIL:${userID}:${config.discord.applicationID}:${config.discord.guildID}`;
        const result = await this.db.HGETALL(key);
        if (!result) {
            return [];
        }
        const audios: VoiceChannelAudio[] = [];
        for (const id of Object.keys(result)) {
            audios.push({
                id,
                repeatTime: Number(result[id].substring(0, result[id].indexOf('|'))),
                url: result[id].substring(result[id].indexOf('|')+1),
            })
        }
        return audios;
    }

    async addVoiceChannelAudio(userID: string, req: VoiceChannelAudio): Promise<void> {
        const key = `${prefixKey}:VOICE_CHANNEL_AUDIO:DETAIL:${userID}:${config.discord.applicationID}:${config.discord.guildID}`;
        await this.db.HSET(key, req.id, `${req.repeatTime}|${req.url}`);
    }

    async removeVoiceChannelAudio(userID: string, id: string): Promise<void> {
        const key = `${prefixKey}:VOICE_CHANNEL_AUDIO:DETAIL:${userID}:${config.discord.applicationID}:${config.discord.guildID}`;
        await this.db.HDEL(key, id);
    }

    async clearVoiceChannelAudio(userID: string): Promise<void> {
        const key = `${prefixKey}:VOICE_CHANNEL_AUDIO:DETAIL:${userID}:${config.discord.applicationID}:${config.discord.guildID}`;
        await this.db.DEL(key);
    }

    async getVoiceChannelAudioStatus(userID: string): Promise<Map<'ENABLED' | 'DISABLED'>> {
        const key = `${prefixKey}:VOICE_CHANNEL_AUDIO:STATUS:${userID}:${config.discord.applicationID}:${config.discord.guildID}`;
        const result = await this.db.HGETALL(key);
        return (result ?? {}) as Map<'ENABLED' | 'DISABLED'>;
    }

    async setVoiceChannelAudioStatus(userID: string, channelID: string, status: 'ENABLED' | 'DISABLED'): Promise<void> {
        const key = `${prefixKey}:VOICE_CHANNEL_AUDIO:STATUS:${userID}:${config.discord.applicationID}:${config.discord.guildID}`;
        await this.db.HSET(key, channelID, status);
    }
}
