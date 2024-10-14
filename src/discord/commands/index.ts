import { CacheType, ChatInputCommandInteraction, Interaction, MessageContextMenuCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, UserContextMenuCommandInteraction } from "discord.js";
import { PlayCommand } from "./play";
import { JoinCommand } from "./join";
import { DiscordService } from "../../service/discord";
import { GetVoiceCommand } from "./get_voice";
import { GetVoiceStatusCommand } from "./get_voice_status";
import { config } from "../../../config/config";
import { AddVoiceCommand } from "./add_voice";
import { RemoveVoiceCommand } from "./remove_voice";
import { ClearVoiceCommand } from "./clear_voice";
import { UpdateVoiceStatusCommand } from "./update_voice_status";

export interface Command {
    command: (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) => Promise<void>;
    input: RESTPostAPIChatInputApplicationCommandsJSONBody;
}

export class CommandDependency {
    constructor(private readonly _discordService: DiscordService) {}

    public get discordService(): DiscordService {
        return this._discordService;
    }
}

export function newDiscordCommands(discordService: DiscordService): Command[] {
    const commandDependency = new CommandDependency(discordService);
    return [
        // new PlayCommand(commandDependency),
        new JoinCommand(commandDependency),
        new GetVoiceCommand(commandDependency),
        new AddVoiceCommand(commandDependency),
        new RemoveVoiceCommand(commandDependency),
        new ClearVoiceCommand(commandDependency),
        new GetVoiceStatusCommand(commandDependency),
        new UpdateVoiceStatusCommand(commandDependency),
    ]
}

export function interactionCreate(commands: Command[]) {
    return (async (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) => {
        if (!interaction.isCommand() || interaction.guildId !== config.discord.guildID) return;
        try {
            const cmd = commands.find(cmd => cmd.input.name === interaction.commandName);
            if (cmd) {
                await cmd.command(interaction);
            }

        } catch (error) {
            console.error(error);
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ content: `${error}`, ephemeral: true });
        }
    }) as (interaction: Interaction<CacheType>) => Promise<void>
}
