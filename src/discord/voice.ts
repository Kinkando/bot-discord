import { VoiceState } from 'discord.js';
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { audioQueue } from './audio';
import { config } from "../config/config";
import { DiscordService } from '../service/discord';

export const voiceStateUpdate = (disordService: DiscordService) => {
    return async (oldState: VoiceState, newState: VoiceState) => {
        // Check if a user has joined a voice channel
        if (!oldState.channelId && newState.channelId && newState.guild.id === config.discord.guildID) {
            if (!newState.member || newState.member?.user.id === config.discord.botID) {
                return;
            }

            const voice = await disordService.getVoiceChannelAudio(newState.member.user.id);
            if (!voice) {
                return;
            }

            const channel = newState.channel!;

            // Join the voice channel
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });

            setTimeout(() => {
                audioQueue.push({ resourceFile: disordService.getLocalPath(voice), connection, left: voice.repeatTime ?? 1 });
            }, 500);

            console.log(`${newState.member?.user.username} joined ${channel.name}`);
        }
    }
}
