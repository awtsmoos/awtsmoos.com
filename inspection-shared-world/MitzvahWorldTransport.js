// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldTransport.js
 * @description Correlates versioned requests across replaceable socket garments.
 * The Awtsmoos renews every wire while this Awtsmoos.com vessel keeps request
 * identity, sequence law, and pending promises bounded and explicit.
 */
const APPLICATION = 'mitzvah-world';
const PROTOCOL = 'awtsmoos.realtime';
const VERSION = 1;

export class MitzvahWorldTransport {
	constructor(socket, onMessage) {
		this.onMessage = onMessage;
		this.pending = new Map();
		this.requestSerial = 0;
		this.sequence = 0;
		this.socket = null;
		this.receiveBound = event => this.receive(event.data);
		this.replaceSocket(socket, false);
	}

	replaceSocket(socket, rejectPending = true) {
		if (!socket?.addEventListener || !socket?.send) {
			throw new Error('A WebSocket-like transport is required.');
		}
		if (rejectPending) this.rejectPending('TRANSPORT_REPLACED', 'The realtime transport was replaced.');
		this.socket?.removeEventListener?.('message', this.receiveBound);
		this.socket = socket;
		this.sequence = 0;
		this.socket.addEventListener('message', this.receiveBound);
		return this;
	}

	send(type, payload = {}) {
		this.sequence += 1;
		this.requestSerial += 1;
		const requestId = `mw-${Date.now().toString(36)}-${this.requestSerial}`;
		const promise = new Promise((resolve, reject) => {
			this.pending.set(requestId, { reject, resolve });
		});
		try {
			this.socket.send(JSON.stringify({
				application: APPLICATION,
				payload,
				protocol: PROTOCOL,
				requestId,
				sequence: this.sequence,
				type,
				version: VERSION
			}));
		} catch (error) {
			this.pending.delete(requestId);
			throw error;
		}
		return promise;
	}

	receive(rawMessage) {
		const message = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
		if (message.application !== APPLICATION || message.version !== VERSION) return;
		this.onMessage(message);
		const pending = this.pending.get(message.requestId);
		if (!pending) return;
		this.pending.delete(message.requestId);
		if (message.type === 'error') {
			pending.reject(Object.assign(new Error(message.payload.message), message.payload));
		} else {
			pending.resolve(message);
		}
	}

	rejectPending(code, message) {
		for (const pending of this.pending.values()) {
			pending.reject(Object.assign(new Error(message), { code }));
		}
		this.pending.clear();
	}
}
