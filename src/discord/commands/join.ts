import { CacheType, ChannelType, ChatInputCommandInteraction, CommandInteractionOptionResolver, GuildMember, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { Command, CommandDependency } from ".";

export class JoinCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('join')
        .setDescription('เรียกบอทเข้าสู่ช่องเสียง')
        .addChannelOption(option =>
            option.setName('channel')
                .addChannelTypes(ChannelType.GuildVoice)
                .setDescription('ช่องเสียงที่ต้องการให้บอทเข้าร่วม')
                .setRequired(false)
        )
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        const options = interaction.options as Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        const member = interaction.member as GuildMember;
        const channelId = options.getChannel('channel')?.id ?? member.voice.channelId!;

        if (!interaction.guild) {
            throw Error('You need to be in a voice channel to use this command!');
        }

        // Join the voice channel
        joinVoiceChannel({
            selfMute: false,
            selfDeaf: false,
            channelId,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({ content: `${member.displayName} invited`, ephemeral: true });
    }
}
