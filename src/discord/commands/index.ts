import { CacheType, ChatInputCommandInteraction, Interaction, MessageContextMenuCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, UserContextMenuCommandInteraction } from "discord.js";
import { PlayCommand } from "./play";
import { DiscordRepository } from "../../repository/discord";
import { JoinCommand } from "./join";

export interface Command {
    command: (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) => Promise<void>;
    input: RESTPostAPIChatInputApplicationCommandsJSONBody;
}

export class CommandDependency {
    constructor(private readonly _discordRepository: DiscordRepository) {}

    public disordRepository(): DiscordRepository {
        return this._discordRepository;
    }
}

export function newDiscordCommands(discordRepository: DiscordRepository): Command[] {
    const commandDependency = new CommandDependency(discordRepository);
    return [
        new PlayCommand(commandDependency),
        new JoinCommand(commandDependency),
    ]
}

export function interactionCreate(commands: Command[]) {
    return (async (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) => {
        if (!interaction.isCommand()) return;
        try {
            const cmd = commands.find(cmd => cmd.input.name === interaction.commandName);
            if (cmd) {
                await cmd.command(interaction);
            }
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ content: 'Done!', ephemeral: true });

        } catch (error) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ content: `${error}`, ephemeral: true });
        }
    }) as (interaction: Interaction<CacheType>) => Promise<void>
}
