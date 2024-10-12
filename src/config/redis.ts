export interface RedisConfig {
    readonly host: string
    readonly port: number
    readonly username?: string;
    readonly password?: string;
}
