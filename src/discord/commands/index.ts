import { joinCommand } from "./join";
import { playCommand } from "./play";

const command = [
    {
        command: playCommand.command,
        input: playCommand.input,
    },
    {
        command: joinCommand.command,
        input: joinCommand.input,
    },
];

export {
    command,
}
