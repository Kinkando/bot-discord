export type DiscordConfig = {
    readonly botToken: string;
    readonly applicationID: string;
    readonly guildID: string;
    readonly botID: string;
    readonly allowedUserIDs?: string[];
    readonly allowedRoleIDs?: string[];
    readonly allowedChannelIDs?: string[];
}
