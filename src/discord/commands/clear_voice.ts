import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { Command, CommandDependency } from ".";

export class ClearVoiceCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('clear-voice')
        .setDescription('ล้าง sound board ทั้งหมดของผู้ใช้')
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        try {
            await this.dependency.discordService.clearVoiceChannelAudio(interaction.member!.user.id);

            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: 'Remove audio successfully!' });

        } catch (error) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: `${error}` });
        }

    }
}
