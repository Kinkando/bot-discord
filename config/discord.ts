export type DiscordConfig = {
    readonly botToken: string;
    readonly applicationID: string;
    readonly guildID: string;
    readonly botID: string;
    readonly voices: DiscordVoiceConfig[];
    readonly defaultVoicePath: string;
}

type DiscordVoiceConfig = {
    readonly userID: string;
    readonly audio: string;
    readonly repeatTime: number;
}
