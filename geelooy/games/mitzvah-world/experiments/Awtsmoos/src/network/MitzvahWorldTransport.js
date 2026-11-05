// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file MitzvahWorldTransport.js
	* @description Correlates bounded requests across replaceable, detachable sockets.
	* The Awtsmoos renews each wire while no orphan promise remains beneath the sea;
	* Awtsmoos.com settles replies, isolates malformed frames, and closes every gate.
	*/

import { MitzvahWorldPendingRequests } from './MitzvahWorldPendingRequests.js';
import {
	createMitzvahWorldEnvelope,
	parseMitzvahWorldMessage,
	realtimeResponseError,
	transportFailure
} from './MitzvahWorldTransportProtocol.js';

export class MitzvahWorldTransport {
	constructor(socket, onMessage, options = {}) {
		this.onMessage = onMessage || (() => {});
		this.onProtocolError = options.onProtocolError || (() => {});
		this.requests = new MitzvahWorldPendingRequests(options);
		this.pending = this.requests.pending;
		this.requestSerial = 0;
		this.sequence = 0;
		this.socket = null;
		this.receiveBound = event => {
			if (event?.target && event.target !== this.socket) return;
			this.receive(event?.data);
		};
		this.replaceSocket(socket, false);
	}
	replaceSocket(socket, rejectPending = true) {
		if (!socket?.addEventListener || !socket?.send) {
			throw transportFailure(
				'INVALID_REALTIME_SOCKET',
				'A WebSocket-like transport is required.'
			);
		}
		if (this.socket === socket) return this;
		this.detach(rejectPending ? 'TRANSPORT_REPLACED' : null);
		this.socket = socket;
		this.sequence = 0;
		socket.addEventListener('message', this.receiveBound);
		return this;
	}
	detach(code = 'TRANSPORT_CLOSED', socket = this.socket) {
		if (socket && socket !== this.socket) return false;
		this.socket?.removeEventListener?.('message', this.receiveBound);
		this.socket = null;
		if (code) this.requests.rejectAll(code, transportMessage(code));
		return true;
	}
	close(code = 'TRANSPORT_CLOSED') {
		const socket = this.socket;
		this.detach(code, socket);
		socket?.close?.();
	}
	send(type, payload = {}) {
		if (!this.socket || Number(this.socket.readyState) >= 2) {
			return Promise.reject(transportFailure(
				'TRANSPORT_CLOSED',
				transportMessage('TRANSPORT_CLOSED')
			));
		}
		this.sequence += 1;
		this.requestSerial += 1;
		const requestId = `mw-${Date.now().toString(36)}-${this.requestSerial}`;
		const promise = this.requests.create(requestId, type);
		try {
			this.socket.send(JSON.stringify(createMitzvahWorldEnvelope({
				payload,
				requestId,
				sequence: this.sequence,
				type
			})));
		} catch (error) {
			this.requests.reject(requestId, error);
		}
		return promise;
	}
	receive(rawMessage) {
		let message;
		try {
			message = parseMitzvahWorldMessage(rawMessage);
		} catch (error) {
			this.report(error, rawMessage);
			return false;
		}
		if (!message) return false;
		const request = message.requestId
			? this.requests.take(message.requestId)
			: null;
		if (request) {
			message.type === 'error'
				? request.reject(realtimeResponseError(message))
				: request.resolve(message);
		}
		try {
			this.onMessage(message);
		} catch (error) {
			this.report(error, message);
		}
		return true;
	}
	report(error, context) {
		try {
			this.onProtocolError(error, context);
		} catch {
			// Diagnostics may never interrupt transport settlement.
		}
	}
}

function transportMessage(code) {
	return code === 'TRANSPORT_REPLACED'
		? 'The realtime transport was replaced.'
		: 'The realtime transport closed.';
}
