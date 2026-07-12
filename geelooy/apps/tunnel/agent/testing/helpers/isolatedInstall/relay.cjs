// B"H
const crypto = require('node:crypto');
const net = require('node:net');
const Frames = require('./relayFrames.cjs');

/** B"H — The mock relay records every direction, parse error, and socket event. */
class Relay {
	constructor() {
		this.messages = [];
		this.sent = [];
		this.events = [];
		this.errors = [];
		this.buffer = Buffer.alloc(0);
		this.ready = false;
	}

	async start() {
		this.server = net.createServer(socket => this.attach(socket));
		await new Promise(resolve => this.server.listen(0, '127.0.0.1', resolve));
		this.port = this.server.address().port;
		this.events.push({ event: 'listening', port: this.port });
		return `ws://127.0.0.1:${this.port}`;
	}

	close() {
		try { this.socket?.destroy(); } catch {}
		try { this.server?.close(); } catch {}
	}

	attach(socket) {
		this.socket = socket;
		this.events.push({ event: 'connected' });
		let headers = Buffer.alloc(0);
		socket.on('data', chunk => {
			if (this.ready) return this.consumeFrames(chunk);
			headers = Buffer.concat([headers, chunk]);
			const headerEnd = headers.indexOf('\r\n\r\n');
			if (headerEnd < 0) return;
			this.acceptHandshake(socket, headers.slice(0, headerEnd));
			this.ready = true;
			this.events.push({ event: 'handshake' });
			const remaining = headers.slice(headerEnd + 4);
			if (remaining.length) this.consumeFrames(remaining);
		});
		socket.on('error', error => this.errors.push(`socket:${error.message}`));
		socket.on('close', () => this.events.push({ event: 'closed' }));
	}

	acceptHandshake(socket, headers) {
		const match = /Sec-WebSocket-Key:\s*(.+)/i.exec(headers.toString('utf8'));
		if (!match) throw new Error('missing_websocket_key');
		const accept = crypto.createHash('sha1')
			.update(`${match[1].trim()}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
			.digest('base64');
		socket.write([
			'HTTP/1.1 101 Switching Protocols',
			'Upgrade: websocket',
			'Connection: Upgrade',
			`Sec-WebSocket-Accept: ${accept}`,
			'',
			''
		].join('\r\n'));
	}

	consumeFrames(chunk) {
		this.buffer = Buffer.concat([this.buffer, chunk]);
		while (true) {
			const frame = Frames.readClientFrame(this.buffer);
			if (!frame) return;
			this.buffer = this.buffer.slice(frame.consumed);
			this.events.push({ event: 'frame', opcode: frame.opcode, bytes: frame.payload.length });
			if (frame.opcode !== 1 && frame.opcode !== 2) continue;
			try {
				this.messages.push(JSON.parse(frame.payload.toString('utf8')));
			} catch (error) {
				this.errors.push(`json:${error.message}:${frame.payload.toString('utf8').slice(0, 400)}`);
			}
		}
	}

	send(value) {
		this.sent.push(value);
		this.socket.write(Frames.writeServerFrame(JSON.stringify(value)));
	}

	waitFor(predicate, timeoutMs = 12000) {
		return new Promise((resolve, reject) => {
			const startedAt = Date.now();
			const timer = setInterval(() => {
				const found = this.messages.find(predicate);
				if (found) {
					clearInterval(timer);
					return resolve(found);
				}
				if (Date.now() - startedAt > timeoutMs) {
					clearInterval(timer);
					reject(new Error(`mock relay timeout: ${JSON.stringify(this.snapshot())}`));
				}
			}, 20);
		});
	}

	snapshot() {
		return {
			ready: this.ready,
			messages: this.messages.slice(-20),
			sent: this.sent.slice(-20),
			events: this.events.slice(-40),
			errors: this.errors.slice(-20),
			bufferBytes: this.buffer.length
		};
	}
}

module.exports = { Relay };
