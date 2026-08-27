// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldTransport.js
 * @description Correlates versioned requests with finite deadlines across replaceable sockets.
 * The Awtsmoos renews every wire while Awtsmoos.com keeps request identity and pending
 * promises bounded, preventing a silent world.join promise from remaining forever.
 */

const APPLICATION = 'mitzvah-world';
const PROTOCOL = 'awtsmoos.realtime';
const VERSION = 1;

export class MitzvahWorldTransport {
	constructor(socket, onMessage, options = {}) {
		this.onMessage = onMessage;
		this.pending = new Map();
		this.requestSerial = 0;
		this.sequence = 0;
		this.socket = null;
		this.requestTimeoutMs = options.requestTimeoutMs ?? 8000;
		this.schedule = options.schedule || globalThis.setTimeout?.bind(globalThis);
		this.cancelSchedule = options.cancelSchedule || globalThis.clearTimeout?.bind(globalThis);
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
			const timer = this.scheduleTimeout(requestId, type, reject);
			this.pending.set(requestId, { reject, resolve, timer });
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
			this.clearPending(requestId);
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
		this.clearPending(message.requestId);
		if (message.type === 'error') {
			pending.reject(Object.assign(new Error(message.payload.message), message.payload));
		} else pending.resolve(message);
	}

	rejectPending(code, message) {
		for (const [requestId, pending] of this.pending) {
			this.clearPending(requestId);
			pending.reject(Object.assign(new Error(message), { code }));
		}
	}

	scheduleTimeout(requestId, type, reject) {
		if (!this.schedule || this.requestTimeoutMs <= 0) return null;
		const timer = this.schedule(() => {
			if (!this.pending.delete(requestId)) return;
			reject(Object.assign(new Error(`Realtime request timed out: ${type}`), {
				code: 'REALTIME_REQUEST_TIMEOUT',
				requestType: type
			}));
		}, this.requestTimeoutMs);
		timer?.unref?.();
		return timer;
	}

	clearPending(requestId) {
		const pending = this.pending.get(requestId);
		if (!pending) return null;
		if (pending.timer !== null) this.cancelSchedule?.(pending.timer);
		this.pending.delete(requestId);
		return pending;
	}
}
