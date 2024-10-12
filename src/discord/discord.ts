import { Client, CommandInteractionOptionResolver, GatewayIntentBits, REST, Routes } from 'discord.js';
import { command } from './commands';
import { voiceStateUpdate } from './voice';
import { config } from '../../config/config';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

async function registerCommands() {
    const rest = new REST({ version: '10'}).setToken(config.discord.botToken);
    await rest.put(Routes.applicationGuildCommands(config.discord.applicationID, config.discord.guildID), { body: command.map(cmd => cmd.input) });
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on('voiceStateUpdate', voiceStateUpdate);

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    try {
        const cmd = command.find(cmd => cmd.input.name === interaction.commandName);
        if (cmd) {
            await cmd.command(interaction);
        }
        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({ content: 'Done!', ephemeral: true });

    } catch (error) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({ content: `${error}`, ephemeral: true });
    }
})

export {
    client,
    registerCommands,
}
