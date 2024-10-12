import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, GuildMember, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import yts from "yt-search";
import { play } from "../audio";

export const playCommand = {
    input: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays audio from a youtube URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL of the audio to play')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('search')
                .setDescription('The name of audio to be play')
                .setRequired(false)
        )
        .toJSON(),

    command: async (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) => {
        const options = interaction.options as Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        const member = interaction.member as GuildMember;

        let url = options.getString('url') ?? '';
        const search = options.getString('search') ?? '';

        if (!url && !search) {
            return await interaction.reply('Invalid argument, please try again!');
        }

        if (!interaction.guild) {
            return await interaction.reply('You need to be in a voice channel to use this command!');
        }

        if (!url) {
            try {
                const { videos } = await yts(search);
                if (!videos.length) {
                    throw Error('Video not found');
                }
                url = videos[0].url;
            } catch (error) {
                console.log(error)
                return await interaction.reply('Video not found, please try again!');
            }
        }

        // Join the voice channel
        const connection = joinVoiceChannel({
            channelId: member.voice.channelId!,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        const stream = ytdl(url, { filter: 'audioonly' });
        play({ resourceFile: stream, connection, left: 1 });

        return await interaction.reply(`Playing youtube '${url}'`);
    },
}
