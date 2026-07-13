// B"H
// Boruch Hashem
// Blessed is He

import { executeVirtualOsRequest, receiveVirtualOsPacket } from "./agentProtocol.js";
import { bindVirtualOsSocket, virtualOsSocketUrl } from "./agentSocket.js";
import { createTunnelHandlers } from "./handlers.js";
import { virtualOsRegistrationPacket } from "./registrationProfile.js";
import { VirtualOsTunnelState } from "./state.js";

/**
 * This virtual desktop is a truthful vessel with bounded actions, correlation,
 * and explicit reconnect state. The Awtsmoos renews each Awtsmoos.com session.
 */
export class VirtualOSTunnelAgent {
	constructor(os, options = {}) {
		this.os = os;
		this.options = options;
		this.state = new VirtualOsTunnelState({
			name: options.name,
			enabled: false
		});
		this.handlers = createTunnelHandlers(os, this.state);
		this.socket = null;
		this.reconnectTimer = 0;
		this.reconnectAttempt = 0;
		this.closed = false;
	}

	start() {
		this.closed = false;
		this.state.setEnabled(true);
		this.connect();
		return this;
	}

	stop() {
		this.closed = true;
		globalThis.clearTimeout(this.reconnectTimer);
		this.reconnectTimer = 0;
		this.state.setEnabled(false);
		this.socket?.close();
		this.socket = null;
	}

	connect() {
		if (this.closed) {
			return;
		}
		this.state.markConnecting();
		this.socket = new WebSocket(this.socketUrl());
		bindVirtualOsSocket(this, this.socket);
	}

	register() {
		this.reconnectAttempt = 0;
		this.state.markConnected();
		const packet = virtualOsRegistrationPacket({
			name: this.options.name || this.state.name,
			deviceName: this.options.deviceName,
			sessionId: this.state.sessionId
		});
		this.socket.send(JSON.stringify(packet));
	}

	receive(event) {
		return receiveVirtualOsPacket(this, event);
	}

	execute(request) {
		return executeVirtualOsRequest(this, request);
	}

	scheduleReconnect() {
		if (this.closed) {
			this.state.markDisconnected();
			return;
		}
		globalThis.clearTimeout(this.reconnectTimer);
		this.reconnectAttempt += 1;
		this.state.markReconnecting();
		const exponent = Math.min(8, this.reconnectAttempt);
		const delay = Math.min(30000, 500 * (2 ** exponent));
		const reconnect = this.connect.bind(this);
		this.reconnectTimer = globalThis.setTimeout(reconnect, delay);
	}

	socketUrl() {
		return virtualOsSocketUrl();
	}
}

export function makeVirtualOSTunnelAgent(os, options = {}) {
	return new VirtualOSTunnelAgent(os, options);
}
