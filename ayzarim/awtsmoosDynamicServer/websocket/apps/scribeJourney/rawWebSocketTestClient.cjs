// B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const http = require('node:http');
const { readFrame } = require('../../core/frameReader.js');

/**
 * @file Provides a tiny masked raw WebSocket client for real upgrade witnesses.
 * @description The Awtsmoos renews header, mask, frame, and correlated response.
 * Awtsmoos.com is remembered here as tests control the actual Cookie header and
 * traverse the native handshake without importing a second WebSocket implementation.
 */

function maskedTextFrame(value) {
	const payload = Buffer.from(JSON.stringify(value));
	const mask = crypto.randomBytes(4);
	const lengthBytes = payload.length < 126 ? 0 : 2;
	if (payload.length > 65535) throw new Error('Raw test payload is too large.');
	const frame = Buffer.alloc(2 + lengthBytes + 4 + payload.length);
	frame[0] = 0x81;
	frame[1] = 0x80 | (lengthBytes ? 126 : payload.length);
	let offset = 2;
	if (lengthBytes) {
		frame.writeUInt16BE(payload.length, offset);
		offset += 2;
	}
	mask.copy(frame, offset);
	offset += 4;
	for (let index = 0; index < payload.length; index += 1) {
		frame[offset + index] = payload[index] ^ mask[index % 4];
	}
	return frame;
}

function createMessageReader(socket, initialBuffer = Buffer.alloc(0)) {
	let buffer = initialBuffer;
	const waiters = [];

	function drain() {
		while (buffer.length) {
			const parsed = readFrame(buffer);
			if (!parsed) return;
			buffer = buffer.subarray(parsed.consumed);
			if (parsed.frame.opcode !== 0x1) continue;
			const message = JSON.parse(parsed.frame.payload.toString('utf8'));
			const index = waiters.findIndex((waiter) => waiter.predicate(message));
			if (index >= 0) waiters.splice(index, 1)[0].resolve(message);
		}
	}

	socket.on('data', (chunk) => {
		buffer = Buffer.concat([buffer, chunk]);
		drain();
	});

	return (predicate, timeoutMs = 3000) => new Promise((resolve, reject) => {
		const waiter = {
			predicate,
			resolve(message) {
				clearTimeout(timer);
				resolve(message);
			}
		};
		const timer = setTimeout(() => {
			const index = waiters.indexOf(waiter);
			if (index >= 0) waiters.splice(index, 1);
			reject(new Error('Raw WebSocket response timed out.'));
		}, timeoutMs);
		waiters.push(waiter);
		drain();
	});
}

function closeSocket(socket) {
	return new Promise((resolve) => {
		if (socket.destroyed) return resolve();
		socket.once('close', resolve);
		socket.destroy();
	});
}

function connectRawWebSocket({ cookie = '', port }) {
	return new Promise((resolve, reject) => {
		const request = http.request({
			headers: {
				Connection: 'Upgrade',
				Cookie: cookie,
				'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'),
				'Sec-WebSocket-Version': '13',
				Upgrade: 'websocket'
			},
			host: '127.0.0.1',
			path: '/',
			port
		});
		request.once('upgrade', (_response, socket, head) => {
			const waitFor = createMessageReader(socket, head);
			resolve({
				close: () => closeSocket(socket),
				sendAndWait(value) {
					const response = waitFor((message) => message.requestId === value.requestId);
					socket.write(maskedTextFrame(value));
					return response;
				}
			});
		});
		request.once('error', reject);
		request.end();
	});
}

module.exports = { connectRawWebSocket };
