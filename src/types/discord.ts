export type VoiceChannelAudio = {
    id: string;
    url: string;
    repeatTime?: number;
}

export interface IncomingUser {
  readonly userID: string;
  readonly roleIDs: string[];
  readonly channelID?: string | null;
}

export interface AllowedUsers {
  readonly allowedUserIDs?: string[];
  readonly allowedRoleIDs?: string[];
  readonly allowedChannelIDs?: string[];
}
