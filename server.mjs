import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import * as crypto from "crypto";

const app = express();

app.use(cors());
app.use(bodyParser.json({ type: () => true}));
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    next();
});

const userState = [];

app.post('/new-user', async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        const result = { status: 'error', message: 'This name is already taken' };

        res.status(400).send(JSON.stringify(result)).end();
    }

    const { name } = req.body;

    const isExist = userState.find(user => user.name === name);

    if (!isExist) {
        const newUser = {
            id: crypto.randomUUID(),
            name: name
        };

        userState.push(newUser);

        const result = { status: 'success', data: newUser };

        res.send(JSON.stringify(result)).end();
    } else {
        const result = { status: 'error', message: 'This name is already taken' };

        res.status(409).send(JSON.stringify(result)).end();
    }
});

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

wsServer.on('connection', (ws) => {
    ws.on('message', (message, isBinary) => {
        const data = JSON.parse(message);

        console.dir(data);

        if (data.type === 'exit') {
            const index = userState.findIndex(user => user.name === data.name);

            userState.splice(index, 1);

            [...wsServer.clients]
            .filter(client => client.readyState === WebSocket.OPEN)
            .forEach(client => client => client.send(JSON.stringify(userState)));

            return;
        }

        if (data.type === 'send') {
            [...wsServer.clients]
            .filter(client => client.readyState === WebSocket.OPEN)
            .forEach(client => client.send(message, {binary: isBinary}));
        };
    });

    [...wsServer.clients]
    .filter(client => client.readyState === WebSocket.OPEN)
    .forEach(client => client.send(JSON.stringify(userState)));
});

const port = process.env.PORT || 3000;

const bootstrap = async () => {
    try {
        server.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};

bootstrap();