import { CacheType, ChatInputCommandInteraction, GuildMemberRoleManager, Interaction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, UserContextMenuCommandInteraction } from "discord.js";
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
import { AllowedUsers, IncomingUser } from "../../types/discord";

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
    const allowedUsers: AllowedUsers = {
        allowedChannelIDs: config.discord.allowedChannelIDs,
        allowedUserIDs: config.discord.allowedUserIDs,
        allowedRoleIDs: config.discord.allowedRoleIDs,
    }
    return (async (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction | ModalSubmitInteraction<CacheType>) => {
        if (interaction.guildId !== config.discord.guildID) return;
        const name = interaction.isCommand() ? interaction.commandName : interaction.isModalSubmit() ? interaction.customId : undefined;
        try {
            if (name) {
                try {
                    const userID = interaction.user.id;
                    const channelID = interaction.channel?.id ?? interaction.channelId;
                    const roleIDs = (interaction.member!.roles as GuildMemberRoleManager).cache.map(({ id }) => id);
                    allowed({ userID, channelID, roleIDs }, allowedUsers);

                } catch (error) {
                    await interaction.deferReply({ ephemeral: true });
                    await interaction.followUp({ content: `${error}`, ephemeral: true });
                }

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

export function allowed(incomingUser: IncomingUser, allowedUsers: AllowedUsers) {
    const { userID, roleIDs, channelID } = incomingUser;
    const { allowedUserIDs, allowedRoleIDs, allowedChannelIDs } = allowedUsers;

    if (channelID && allowedChannelIDs?.length && !allowedChannelIDs.includes(channelID)) {
        throw new Error(`This command is not allowed in this channel`);
    }

    const requiredAuthorization = !!allowedUserIDs?.length || !!allowedRoleIDs?.length;
    if (requiredAuthorization) {
        const allowed = allowedUserIDs?.includes(userID) || allowedRoleIDs?.some((roleID) => roleIDs.some((rID) => rID === roleID));
        if (!allowed) {
            throw new Error(`You are not allowed to use this command`);
        }
    }
}
