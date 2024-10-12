import { VoiceState } from 'discord.js';
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { audioQueue } from './audio';
import { config } from "../config/config";
import { DiscordRepository } from '../repository/discord';

export const voiceStateUpdate = (discordRepository: DiscordRepository) => {
    return async (oldState: VoiceState, newState: VoiceState) => {
        // Check if a user has joined a voice channel
        if (!oldState.channelId && newState.channelId && newState.guild.id === config.discord.guildID) {
            if (newState.member?.user.id === config.discord.botID) {
                return;
            }

            const voice = config.discord.voices.find(voice => voice.userID === newState.member?.user.id) ?? { audio: config.discord.defaultVoicePath, repeatTime: 1 };

            const channel = newState.channel!;

            // Join the voice channel
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });

            setTimeout(() => {
                audioQueue.push({ resourceFile: voice.audio, connection, left: voice.repeatTime });
            }, 500);

            console.log(`${newState.member?.user.username} joined ${channel.name}`);
        }
    }
}
