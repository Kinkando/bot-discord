import { AudioPlayerStatus, createAudioPlayer, createAudioResource, StreamType, VoiceConnection } from "@discordjs/voice";
import internal from "stream";
import { TaskQueue } from "../types/task_queue";

type AudioArgument = {
    resourceFile: internal.Readable | string;
    connection: VoiceConnection;
    left: number;
}

const audioQueue = new TaskQueue<AudioArgument>(play);

async function play({resourceFile, connection, left = 1}: AudioArgument): Promise<void> {
    return await new Promise(resolve => {
        // Create audio player
        const audioPlayer = createAudioPlayer({
            // behaviors: {
            //     noSubscriber: NoSubscriberBehavior.Pause,
            // },
        });

        // Create an audio resource (replace with your audio file URL or path)
        const resource = createAudioResource(resourceFile, {
            inputType: typeof resourceFile !== 'string' ? StreamType.Arbitrary : undefined,
        }); // Update with actual path or URL

        audioPlayer.play(resource);
        connection.subscribe(audioPlayer);

        audioPlayer.on(AudioPlayerStatus.Idle, async (oldS, newS) => {
            if (left <= 1) {
                connection.disconnect();
                resolve();
                return;
            }
            await play({resourceFile, connection, left: left-1});
            resolve(); // Resolve after the recursive call
        });

        audioPlayer.on('error', error => {
            console.error(`Error: ${error.message}`);
            connection.disconnect();
            resolve();
        });
    })
}

export {
    audioQueue,
    play,
    AudioArgument,
}
