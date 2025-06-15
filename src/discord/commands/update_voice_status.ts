import { CacheType, ChannelType, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { Command, CommandDependency } from ".";
import { config } from "../../../config/config";

export class UpdateVoiceStatusCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('update-voice-status')
        .setDescription('เปิด/ปิดการใช้งาน auto sound board ใน voice chat')
        .addChannelOption(option =>
            option.setName('channel')
                .addChannelTypes(ChannelType.GuildVoice)
                .setDescription('voice chat id or name')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('status')
                .setDescription('สถานะการใช้งาน เปิด/ปิด')
                .setRequired(true)
                .addChoices(
                    { name: 'เปิด', value: 'ENABLED' },
                    { name: 'ปิด', value: 'DISABLED' }
                )
        )
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        const options = interaction.options as Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        const channel = options.getChannel("channel")!;
        const status = options.getString("status")! as 'ENABLED' | 'DISABLED';

        try {
            const guild = await interaction.client.guilds.fetch(config.discord.guildID);
            const voice = guild.channels.cache.find(ch => ch.isVoiceBased() && (ch.name === channel.name || ch.id === channel.id));
            if (!voice) {
                throw Error('Voice chat channel not found, please try again!');
            }

            await this.dependency.discordService.setVoiceChannelAudioStatus(interaction.member!.user.id, voice.id, status);

            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: 'Update voice status successfully!' });

        } catch (error) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: `${error}` });
        }

    }
}
