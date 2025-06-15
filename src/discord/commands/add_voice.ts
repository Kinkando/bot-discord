import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageContextMenuCommandInteraction, ModalSubmitInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { Command, CommandDependency } from ".";

export class AddVoiceCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('add-voice')
        .setDescription('เพิ่ม sound board ของผู้ใช้')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('ลิงก์เพลง')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('repeat-time')
                .setDescription('จำนวนการเล่นซ้ำ')
                .setRequired(false)
        )
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction | ModalSubmitInteraction) {
        const options = (interaction as ChatInputCommandInteraction).options as Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        const url = options.getString("url") ?? '';
        const repeatTime = Math.floor(options.getNumber("repeat-time") || 1);

        try {
            if (repeatTime < 1) {
                throw Error('invalid arguments');
            }

            await this.dependency.discordService.addVoiceChannelAudio(interaction.member!.user.id, url, repeatTime);

            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: 'Add new audio successfully!' });

        } catch (error) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: `${error}` });
        }

    }
}
