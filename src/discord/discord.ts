import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { interactionCreate, newDiscordCommands } from './commands';
import { voiceStateUpdate } from './voice';
import { config } from '../config/config';
import { DiscordService } from '../service/discord';

export async function newDiscord(discordService: DiscordService) {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildVoiceStates,
        ],
    });

    const commands = newDiscordCommands(discordService);

    client.once('ready', () => console.log(`Logged in as ${client.user?.tag}`));

    client.on('voiceStateUpdate', voiceStateUpdate(discordService));

    client.on('interactionCreate', interactionCreate(commands));

    const rest = new REST({ version: '10'}).setToken(config.discord.botToken);
    await rest.put(Routes.applicationGuildCommands(config.discord.applicationID, config.discord.guildID), { body: commands.map(cmd => cmd.input) });

    client.login(config.discord.botToken);
}
