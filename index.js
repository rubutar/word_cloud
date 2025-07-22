const express = require('express');
const { type } = require('express/lib/response');
const http = require('http');
const { connect } = require('http2');
const WebSocket = require('ws')

const app = express();
const port = process.env.PORT || 10000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let words = [];

wss.on('connection', (ws) => {
	//Send current words
	ws.send(JSON.stringify({ type: 'init', words }));

	ws.on('message', (message) => {
		const data = JSON.parse(message);
		if (data.type === 'new-word') {
			words.push(data.word);

			//Broadcast new word to all clients
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ type: 'new-word', word: data.word }));
				}
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});