//B"H
//Boruch Hashem
//Blessed is He

/**
 * Versioned requests travel through a socket without confusing transport with
 * world truth. The Awtsmoos renews each packet; Awtsmoos.com supports both the
 * original positional constructor and the newer options-object constructor.
 */

import { createRequestEnvelope, createRequestId } from './ProtocolEnvelope.js';
import { normalizeRealtimeClientOptions } from './RealtimeClientOptions.js';
import { RealtimeRequests } from './RealtimeRequests.js';
import { RealtimeSocket } from './RealtimeSocket.js';

/** Owns versioned envelopes, correlated requests, parsing, and typed event fanout. */
export class RealtimeClient {
	constructor(applicationOrOptions = {}, version = 1, url) {
		const options = normalizeRealtimeClientOptions(applicationOrOptions, version, url);
		this.application = options.application;
		this.version = options.version;
		this.listeners = new Map();
		this.requests = new RealtimeRequests();
		this.sequence = 0;
		this.socket = new RealtimeSocket(options.url, {
			close: event => this.handleClose(event),
			message: rawMessage => this.receive(rawMessage),
			open: () => this.emit('connection.open', {})
		});
	}

	connect() {
		return this.socket.connect();
	}

	/** Auto-connects, sends one correlated request, and returns its response. */
	async request(type, payload = {}) {
		await this.connect();
		const envelope = this.createEnvelope(type, payload);
		const response = this.requests.open(envelope.requestId);
		this.sendEnvelope(envelope);
		return response;
	}

	/** Sends a versioned command whose response is intentionally not awaited. */
	send(type, payload = {}) {
		this.sendEnvelope(this.createEnvelope(type, payload));
	}

	/** Subscribes to one typed server event and returns an unsubscribe function. */
	on(type, listener) {
		const listeners = this.listeners.get(type) || new Set();
		listeners.add(listener);
		this.listeners.set(type, listeners);
		return () => {
			listeners.delete(listener);
		};
	}

	close() {
		this.socket.close();
	}

	createEnvelope(type, payload) {
		this.sequence += 1;
		return createRequestEnvelope({
			application: this.application,
			payload,
			requestId: createRequestId(),
			sequence: this.sequence,
			type,
			version: this.version
		});
	}

	sendEnvelope(envelope) {
		this.socket.send(JSON.stringify(envelope));
	}

	receive(rawMessage) {
		let message;
		try {
			message = JSON.parse(rawMessage);
		} catch (error) {
			this.emit('connection.error', { error });
			return;
		}
		if (!this.requests.resolve(message)) {
			this.emit(message.type, message.payload || {});
		}
	}

	/** Emits both modern and original close event names with the same payload. */
	handleClose(event = {}) {
		this.requests.rejectAll(new Error('Real-time connection closed.'));
		const payload = { code: event.code };
		this.emit('connection.close', payload);
		this.emit('connection.closed', payload);
	}

	emit(type, payload) {
		for (const listener of this.listeners.get(type) || []) {
			listener(payload);
		}
	}
}
