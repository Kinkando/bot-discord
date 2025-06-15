import { CacheType, ChatInputCommandInteraction, Interaction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, UserContextMenuCommandInteraction } from "discord.js";
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
import { ImageGenerationAIService } from "../../service/image_generation_ai";
import { GenerateImageCommand } from "./generate_image";

export interface Command {
    command: (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction | ModalSubmitInteraction) => Promise<void>;
    input: RESTPostAPIChatInputApplicationCommandsJSONBody;
}

export class CommandDependency {
    constructor(
        private readonly _discordService: DiscordService,
        private readonly _imageGenerationAIService: ImageGenerationAIService,
    ) {}

    public get discordService(): DiscordService {
        return this._discordService;
    }

    public get imageGenerationAIService(): ImageGenerationAIService {
        return this._imageGenerationAIService;
    }
}

export function newDiscordCommands(discordService: DiscordService, imageGenerationAIService: ImageGenerationAIService): Command[] {
    const commandDependency = new CommandDependency(discordService, imageGenerationAIService);
    return [
        // new PlayCommand(commandDependency),
        new JoinCommand(commandDependency),
        new GetVoiceCommand(commandDependency),
        new AddVoiceCommand(commandDependency),
        new RemoveVoiceCommand(commandDependency),
        new ClearVoiceCommand(commandDependency),
        new GetVoiceStatusCommand(commandDependency),
        new UpdateVoiceStatusCommand(commandDependency),
        new GenerateImageCommand(commandDependency),
    ]
}

export function interactionCreate(commands: Command[]) {
    return (async (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction | ModalSubmitInteraction<CacheType>) => {
        if (interaction.guildId !== config.discord.guildID) return;
        const name = interaction.isCommand() ? interaction.commandName : interaction.isModalSubmit() ? interaction.customId : undefined;
        try {
            if (name) {
                const cmd = commands.find(cmd => cmd.input.name === name);
                if (cmd) {
                    await cmd.command(interaction);
                }
            }

        } catch (error) {
            console.error(error);
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ content: `${error}`, ephemeral: true });
        }
    }) as (interaction: Interaction<CacheType>) => Promise<void>
}
