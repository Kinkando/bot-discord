import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { client } from "./discord";
import { config } from "../../config/config";

// Listen for voice state updates
client.on('voiceStateUpdate', (oldState, newState) => {
    // Check if a user has joined a voice channel
    if (!oldState.channelId && newState.channelId && newState.guild.id === config.discord.guildID) {
        const channel = newState.channel;

        // Join the voice channel
        const connection = joinVoiceChannel({
            channelId: channel!.id,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        // Create audio player
        const audioPlayer = createAudioPlayer();

        // Create an audio resource (replace with your audio file URL or path)
        const resource = createAudioResource('assets/audio/joining.mp3'); // Update with actual path or URL

        audioPlayer.play(resource);
        connection.subscribe(audioPlayer);

        audioPlayer.on(AudioPlayerStatus.Idle, (oldS, newS) => {
            connection.disconnect();
        });

        audioPlayer.on('error', error => {
            console.error(`Error: ${error.message}`);
            connection.disconnect();
        });

        console.log(`${newState.member?.user.username} joined ${channel?.name}`);
    }
});