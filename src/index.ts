import express, { Request, Response } from 'express';
import { config } from '../config/config';
import { client } from './discord/discord';

const app = express();

client.login(config.discord.botToken);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'OK' });
});

app.get('/livez', (req: Request, res: Response) => {
    res.status(200).json({ message: 'OK' });
});

app.get('/readyz', (req: Request, res: Response) => {
    res.status(200).json({ message: 'OK' });
});

app.listen(config.app.port, () => {
    console.log(`Server running at http://localhost:${config.app.port}`);
});
