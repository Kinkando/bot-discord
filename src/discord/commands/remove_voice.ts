import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { Command, CommandDependency } from ".";

export class RemoveVoiceCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('remove-voice')
        .setDescription('ลบ sound board ของผู้ใช้')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('รหัสเพลง')
                .setRequired(true)
        )
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        const options = interaction.options as Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        const id = options.getString("id") ?? '';

        try {
            await this.dependency.discordService.removeVoiceChannelAudio(interaction.member!.user.id, id);

            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: 'Remove audio successfully!' });

        } catch (error) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: `${error}` });
        }

    }
}
