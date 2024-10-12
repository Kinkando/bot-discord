import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { interactionCreate, newDiscordCommands } from './commands';
import { voiceStateUpdate } from './voice';
import { config } from '../config/config';
import { DiscordRepository } from '../repository/discord';

async function newDiscord(discordRepository: DiscordRepository) {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildVoiceStates,
        ],
    });

    const commands = newDiscordCommands(discordRepository);

    client.once('ready', () => console.log(`Logged in as ${client.user?.tag}`));

    client.on('voiceStateUpdate', voiceStateUpdate(discordRepository));

    client.on('interactionCreate', interactionCreate(commands));

    const rest = new REST({ version: '10'}).setToken(config.discord.botToken);
    await rest.put(Routes.applicationGuildCommands(config.discord.applicationID, config.discord.guildID), { body: commands.map(cmd => cmd.input) });

    client.login(config.discord.botToken);
}

export {
    newDiscord,
}
