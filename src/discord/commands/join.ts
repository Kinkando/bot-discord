import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, GuildMember, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { config } from "../../../config/config";

export const joinCommand = {
    input: new SlashCommandBuilder()
        .setName('join')
        .setDescription('เรียกบอทเข้าสู่ช่องเสียง')
        .toJSON(),

    command: async (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) => {
        if (interaction.guildId !== config.discord.guildID) {
            return;
        }

        const member = interaction.member as GuildMember;

        if (!interaction.guild) {
            throw Error('You need to be in a voice channel to use this command!');
        }

        // Join the voice channel
        joinVoiceChannel({
            channelId: member.voice.channelId!,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
    },
}
