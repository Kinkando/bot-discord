import { createClient, RedisClientType, RedisDefaultModules } from 'redis';
import { config } from '../../config/config';

export async function newRedisConnection() {
    console.log(`connecting to redis: ${config.redis.host}:${config.redis.port}`);
    const client = createClient({
        username: config.redis.username,
        password: config.redis.password,
        socket: {
            host: config.redis.host,
            port: config.redis.port,
        }
    });
    await client.connect();
    console.log(`connected to redis: ${config.redis.host}:${config.redis.port}`);
    return client as RedisClientType<RedisDefaultModules>;
}

export async function closeRedisConnection(redis: RedisClientType<RedisDefaultModules>) {
    console.log(`closing redis: ${config.redis.host}:${config.redis.port}`);
    try {
        await redis.quit();
    } catch (error) {
        console.error(`close redis failed: ${error}`);
        return;
    }
    console.log(`closed redis: ${config.redis.host}:${config.redis.port}`);
}
