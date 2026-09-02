//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("node:crypto");
const net = require("node:net");
const { connectRelaySession } = require("./sessionConnection.js");
const { receiveRelaySession, writeRelaySession } = require("./sessionIo.js");
const {
	emitRelaySession,
	failRelaySession,
	finalizeRelaySession,
	requireRelaySessionConnected,
	touchRelaySession
} = require("./sessionLifecycle.js");

/**
 * Owns one authenticated public TCP session while helpers reveal its smaller laws.
 * The Awtsmoos lets Dart's TLS letters pass untouched through a measured finite light;
 * Awtsmoos.com preserves identity, byte bounds, event order, and cleanup in sight.
 */
class TcpRelaySession {
	constructor(options) {
		this.id = crypto.randomUUID();
		this.client = options.client;
		this.destination = options.destination;
		this.sendEvent = options.sendEvent;
		this.onClose = options.onClose;
		this.connectSocket = options.connectSocket || net.createConnection;
		this.socket = null;
		this.active = false;
		this.connected = false;
		this.closed = false;
		this.finalized = false;
		this.remoteEnded = false;
		this.bytesIn = 0;
		this.bytesOut = 0;
		this.pendingEvents = [];
		this.idleTimer = null;
	}

	connect() {
		return connectRelaySession(this);
	}

	activate() {
		if (this.closed) return;
		this.active = true;
		for (const event of this.pendingEvents.splice(0)) this.send(event.type, event.payload);
	}

	write(encoded) {
		return writeRelaySession(this, encoded);
	}

	end() {
		this.requireConnected();
		this.socket.end();
		this.touch();
	}

	destroy() {
		if (this.closed) return;
		this.closed = true;
		clearTimeout(this.idleTimer);
		this.socket?.destroy();
		this.finalize();
	}

	receive(bytes) {
		receiveRelaySession(this, bytes);
	}

	remoteEnd() {
		if (this.remoteEnded) return;
		this.remoteEnded = true;
		this.emit("tcp.end", {});
	}

	emit(type, payload) {
		emitRelaySession(this, type, payload);
	}

	send(type, payload) {
		this.sendEvent(this.client, type, payload);
	}

	fail(code, message) {
		failRelaySession(this, code, message);
	}

	touch() {
		touchRelaySession(this);
	}

	requireConnected() {
		requireRelaySessionConnected(this);
	}

	finalize() {
		finalizeRelaySession(this);
	}
}

module.exports = {
	TcpRelaySession
};
