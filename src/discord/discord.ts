import { Client, GatewayIntentBits } from 'discord.js';
import { voiceStateUpdate } from './voice';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on('voiceStateUpdate', voiceStateUpdate)

export {
    client,
}
