import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { Command, CommandDependency } from ".";
import { config } from "../../../config/config";

export class UpdateVoiceStatusCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('update-voice-status')
        .setDescription('เปิด/ปิดการใช้งาน auto sound board ใน voice chat')
        .addStringOption(option =>
            option.setName('channel')
                .setDescription('voice chat id or name')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('status')
                .setDescription('สถานะการใช้งาน เปิด: true, ปิด: false')
                .setRequired(true)
        )
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        const options = interaction.options as Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        let channelID = options.getString("channel")!;
        const isEnabled = options.getBoolean("status")!;

        try {
            const guild = await interaction.client.guilds.fetch(config.discord.guildID);
            const voice = guild.channels.cache.find(channel => channel.isVoiceBased() && (channel.name.includes(channelID) || channel.id === channelID));
            if (!voice) {
                throw Error('Voice chat channel not found, please try again!');
            }
            channelID = voice.id;

            await this.dependency.discordService.setVoiceChannelAudioStatus(interaction.member!.user.id, channelID, isEnabled ? 'ENABLED' : 'DISABLED');

            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: 'Update voice status successfully!' });

        } catch (error) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true, content: `${error}` });
        }

    }
}
