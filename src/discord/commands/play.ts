import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, GuildMember, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import yts from "yt-search";
import { play } from "../audio";
import { config } from "../../../config/config";

export const playCommand = {
    input: new SlashCommandBuilder()
        .setName('play')
        .setDescription('เล่นเพลงจาก YouTube')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('ลิงก์เพลง')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('search')
                .setDescription('ชื่อเพลงที่ต้องการค้นหา')
                .setRequired(false)
        )
        .toJSON(),

    command: async (interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) => {
        if (interaction.guildId !== config.discord.guildID) {
            return;
        }

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

        const stream = ytdl(url, {
            filter: "audioonly",
            liveBuffer: 2000,
            highWaterMark: 1 << 25
            // dlChunkSize: 0, //disabling chunking is recommended in discord bot
            // quality: "lowestaudio",
        });
        play({ resourceFile: stream, connection, left: 1 });
    },
}
