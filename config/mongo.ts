export type MongoDBConfig = {
    readonly scheme: string;
    readonly host: string;
    readonly port?: number;
    readonly username: string;
    readonly password: string;
    readonly database: string;
    readonly queryString: string;
}
