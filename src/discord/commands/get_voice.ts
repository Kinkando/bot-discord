import { CacheType, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { Command, CommandDependency } from ".";
import { config } from "../../../config/config";

export class GetVoiceCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('get-voice')
        .setDescription('แสดง sound board ทั้งหมดของผู้ใช้')
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        if (!interaction.member) {
            return;
        }

        const voices = await this.dependency.discordService.getVoiceChannelAudios(interaction.member.user.id);

        await interaction.deferReply({ ephemeral: true });

        if (voices.length) {
            await interaction.followUp({ ephemeral: true, embeds: [{
                title: `Soundboard of ${interaction.member.user?.username}`,
                fields: voices.map(voice => ({
                    name: voice.id,
                    value: voice.url,
                    inline: true,
                }))
            }] });

        } else {
            await interaction.followUp({ ephemeral: true, embeds: [{
                title: `Soundboard of ${interaction.member.user?.username}`,
                description: `You don't have any soundboard yet.`,
            }] });
        }
    }
}
