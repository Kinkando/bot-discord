import { VoiceState } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, DiscordGatewayAdapterCreator, VoiceConnection } from '@discordjs/voice';
import { config } from "../../config/config";

export const voiceStateUpdate = async (oldState: VoiceState, newState: VoiceState) => {
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
            loopPlay(voice.audio, connection, voice.repeatTime)
        }, 1500);

        console.log(`${newState.member?.user.username} joined ${channel.name}`);
    }
}

function loopPlay(resourceFile: string, connection: VoiceConnection, left: number = 1) {
    // Create audio player
    const audioPlayer = createAudioPlayer();

    // Create an audio resource (replace with your audio file URL or path)
    const resource = createAudioResource(resourceFile); // Update with actual path or URL

    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);

    audioPlayer.on(AudioPlayerStatus.Idle, (oldS, newS) => {
        if (left <= 1) {
            connection.disconnect();
            return
        }
        return loopPlay(resourceFile, connection, left-1)
    });

    audioPlayer.on('error', error => {
        console.error(`Error: ${error.message}`);
        connection.disconnect();
    });
}
