import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, GuildMember, MessageContextMenuCommandInteraction, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import yts from "yt-search";
import { CommandDependency, Command } from ".";
import { play } from "../audio";
import { config } from "../../../config/config";

export class PlayCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
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
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction) {
        const options = interaction.options as Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        const member = interaction.member as GuildMember;

        let url = options.getString('url') ?? '';
        const search = options.getString('search') ?? '';

        if (!url && !search) {
            throw Error('Invalid argument, please try again!');
        }

        if (!interaction.guild) {
            throw Error('You need to be in a voice channel to use this command!');
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
                throw Error('Video not found, please try again!');
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
            highWaterMark: 1 << 25,
            requestOptions: {
                headers: {
                    'User-Agent': config.app.userAgent,
                }
            },
            // dlChunkSize: 0, //disabling chunking is recommended in discord bot
            // quality: "lowestaudio",
        });
        play({ resourceFile: stream, connection, left: 1 });

        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({ content: `Playing YouTube ${url}`, ephemeral: true });
    }
}
