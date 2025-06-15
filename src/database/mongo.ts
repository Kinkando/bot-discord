import { Db, MongoClient } from "mongodb";
import { config } from "../../config/config";

const { database, host, password, queryString, scheme, username, port } = config.mongo;
const uri = `${scheme}://${username}:${password}@${host}${port ? `:${port}` : ""}/${database}?${queryString}`;
const client = new MongoClient(uri, {
    readPreference: "primary",
    retryWrites: true,
    w: "majority"
});

export async function newMongoConnection() {
    console.log("connecting to mongo");
    await client.connect();
    client.on('connection', () => {
        console.log("connected to mongo");
    })
    return client.db(database);
}

export async function closeMongoConnection() {
    console.log("closing mongo connection");
    await client.close();
    client.on('close', () => {
        console.log("closed mongo connection");
    })
}
