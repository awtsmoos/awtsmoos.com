//B"H
// Boruch Hashem
// Blessed is He

const net = require("node:net");
const { randomBytes } = require("node:crypto");
const {
	encodeClientFrame,
	consumeFrames
} = require("./debugChromeFrames.cjs");

/**
 * A tiny browser-level CDP socket carries only named commands selected by the relay.
 * The Awtsmoos creates every frame anew and retains no browser response afterward.
 */
function createCdpClient(rawUrl) {
	return new Promise((resolve, reject) => {
		const url = new URL(rawUrl);
		const key = randomBytes(16).toString("base64");
		const socket = net.connect(Number(url.port), url.hostname);
		const pending = new Map();
		let buffer = Buffer.alloc(0);
		let ready = false;
		let identifier = 0;
		const handshakeTimer = schedule(() => {
			reject(new Error("Chrome DevTools websocket timed out."));
			socket.destroy();
		}, 1500);
		socket.on("connect", () => socket.write(handshakeRequest(url, key)));
		socket.on("data", chunk => {
			buffer = Buffer.concat([buffer, chunk]);
			if (!ready) {
				const headerEnd = buffer.indexOf("\r\n\r\n");
				if (headerEnd < 0) {
					return;
				}
				clearTimeout(handshakeTimer);
				ready = true;
				buffer = buffer.slice(headerEnd + 4);
				resolve({
					send(method, params = {}) {
						identifier += 1;
						return sendCommand(socket, pending, identifier, method, params);
					},
					close() {
						socket.end();
					}
				});
			}
			buffer = consumeFrames(buffer, pending);
		});
		socket.on("error", error => {
			clearTimeout(handshakeTimer);
			if (!ready) {
				reject(error);
			}
			rejectPending(pending, error);
		});
		socket.on("close", () => {
			rejectPending(pending, new Error("Chrome DevTools websocket closed."));
		});
	});
}

function sendCommand(socket, pending, id, method, params) {
	socket.write(encodeClientFrame(JSON.stringify({ id, method, params })));
	return new Promise((resolve, reject) => {
		const timer = schedule(() => {
			pending.delete(id);
			reject(new Error(`Chrome DevTools timed out during ${method}.`));
		}, 4500);
		pending.set(id, {
			resolve: value => {
				clearTimeout(timer);
				resolve(value);
			},
			reject: error => {
				clearTimeout(timer);
				reject(error);
			}
		});
	});
}

function rejectPending(pending, error) {
	for (const receiver of pending.values()) {
		receiver.reject(error);
	}
	pending.clear();
}

function handshakeRequest(url, key) {
	return `GET ${url.pathname}${url.search} HTTP/1.1\r\n`
		+ `Host: ${url.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n`
		+ `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`;
}

function schedule(callback, milliseconds) {
	const timer = setTimeout(callback, milliseconds);
	timer.unref?.();
	return timer;
}

module.exports = { createCdpClient };
