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
let feedbacks = [];
let chats = [];

wss.on('connection', (ws) => {
	ws.send(JSON.stringify({ type: 'init', words, chats, feedbacks }));

	ws.on('message', (message) => {
		const data = JSON.parse(message);
		if (data.type === 'new-word') {
			words.push(data.word);

			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ type: 'new-word', name: data.name, word: data.word }));
				}
			});
		} else if (data.type === 'group-chat') {
			chats.push({ name: data.name, chat: data.word });

			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ type: 'group-chat', name: data.name, chat: data.word }));
				}
			})
		} else {
			feedbacks.push({ name: data.name, feedback: data.word });

			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ type: 'feedback', name: data.name, feedback: data.word }));
				}
			})
		}
	});
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
