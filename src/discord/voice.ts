import { VoiceState } from 'discord.js';
import { joinVoiceChannel, DiscordGatewayAdapterCreator, VoiceConnectionStatus } from '@discordjs/voice';
import { audioQueue } from './audio';
import { config } from "../../config/config";
import { DiscordService } from '../service/discord';

export const voiceStateUpdate = (discordService: DiscordService) => {
    return async (oldState: VoiceState, newState: VoiceState) => {
        // Check if a user has joined a voice channel
        if (!oldState.channelId && newState.channelId && newState.guild.id === config.discord.guildID) {
            if (!newState.member || newState.member?.user.id === config.discord.botID || newState.member?.user.bot) {
                return;
            }

            try {
                const channel = newState.channel!;

                const voice = await discordService.getVoiceChannelAudio(newState.member.user.id);
                if (!voice) {
                    return;
                }

                const voiceStatus = await discordService.getVoiceChannelAudioStatus(newState.member.user.id);
                if (voiceStatus[channel.id] !== 'ENABLED') {
                    return;
                }

                // Join the voice channel
                const connection = joinVoiceChannel({
                    selfMute: false,
                    selfDeaf: false,
                    channelId: channel.id,
                    guildId: newState.guild.id,
                    adapterCreator: newState.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
                });

                setTimeout(() => {
                    audioQueue.push({ resourceFile: discordService.getLocalPath(voice), connection, left: voice.repeatTime ?? 1 });
                }, 500);

                console.log(`${newState.member?.user.username} joined ${channel.name}`);

            } catch (error) {
                console.error(error);
            }
        }
    }
}
