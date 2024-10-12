import { CacheType, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction, VoiceBasedChannel } from "discord.js";
import { Command, CommandDependency } from ".";
import { config } from "../../../config/config";

export class GetVoiceStatusCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('get-voice-status')
        .setDescription('แสดงห้องที่ผู้ใช้สามารถใช้งาน sound board ได้')
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        if (interaction.guildId !== config.discord.guildID || !interaction.member) {
            return;
        }

        const userID = interaction.member.user.id;
        const guild = await interaction.client.guilds.fetch(config.discord.guildID);
        const voiceChannels = guild.channels.cache.filter(channel => channel.isVoiceBased());

        const voices = await this.dependency.discordService.getVoiceChannelAudioStatus(userID);
        const enabledVoiceChannels: VoiceBasedChannel[] = [];
        for (const voiceChannelID of Object.keys(voices)) {
            if (voices[voiceChannelID] === 'DISABLED') {
                continue;
            }
            const voice = voiceChannels.find(voice => voice.id === voiceChannelID);
            if (voice) {
                enabledVoiceChannels.push(voice);
            }
        }

        await interaction.deferReply({ ephemeral: true });

        if (enabledVoiceChannels.length) {
            await interaction.followUp({ ephemeral: true, embeds: [{
                title: `Enable soundboard room of ${interaction.member.user?.username}`,
                fields: enabledVoiceChannels.map(voice => ({
                    name: voice.name,
                    value: voice.id,
                    inline: true,
                }))
            }] });

        } else {
            await interaction.followUp({ ephemeral: true, embeds: [{
                title: `Enable soundboard room of ${interaction.member.user?.username}`,
                description: `You don't have enable soundboard with any room yet.`,
            }] });
        }
    }
}
