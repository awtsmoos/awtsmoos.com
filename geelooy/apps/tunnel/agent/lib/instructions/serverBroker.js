//B"H
//Boruch Hashem
//Blessed be He

const { randomUUID } = require("node:crypto");
const Support = require("./serverBrokerSupport.js");

/**
 * @file Owns bounded server-instruction requests beside the live parent Tunnel socket.
 * @description
 * The Awtsmoos deduplicates equal requests, remembers advertised body hashes, and
 * resolves offline immediately when no current registered websocket can answer.
 */
class ServerInstructionBroker {
	constructor(options = {}) {
		this.timeoutMs = Math.max(250, Number(options.timeoutMs || 2500));
		this.socket = null;
		this.safeSend = null;
		this.index = null;
		this.pending = new Map();
		this.inFlight = new Map();
		this.headlineHashes = new Map();
	}

	bind(socket, safeSend, index = null) {
		if (this.socket && this.socket !== socket) this.failAll();
		this.socket = socket;
		this.safeSend = safeSend;
		this.index = Support.validIndex(index) ? index : null;
		this.remember(index?.headlines);
	}

	unbind(socket) {
		if (socket && this.socket !== socket) return false;
		this.socket = null;
		this.safeSend = null;
		this.failAll();
		return true;
	}

	resolve(evidence = {}) {
		return this.request(
			"resolve",
			{ evidence },
			`resolve:${Support.stable(evidence)}`
		);
	}

	get(instructionIds = []) {
		const ids = [...new Set(instructionIds.map(String))].sort();
		return this.request(
			"get",
			{ instructionIds: ids },
			`get:${ids.join(",")}`
		);
	}

	request(kind, payload, key) {
		if (!this.socket?.opened || typeof this.safeSend !== "function") {
			return Promise.resolve(null);
		}
		if (this.inFlight.has(key)) return this.inFlight.get(key);
		const requestId = `ins:${randomUUID()}`;
		const type = kind === "resolve"
			? "TUNNEL_INSTRUCTION_RESOLVE"
			: "TUNNEL_INSTRUCTION_GET";
		const expected = kind === "resolve"
			? "TUNNEL_INSTRUCTION_RESOLVED"
			: "TUNNEL_INSTRUCTION_DETAILS";
		const promise = new Promise(resolve => {
			const timer = setTimeout(() => {
				this.pending.delete(requestId);
				resolve(null);
			}, this.timeoutMs);
			this.pending.set(requestId, { expected, resolve, timer });
			if (!this.safeSend(this.socket, { type, requestId, ...payload })) {
				clearTimeout(timer);
				this.pending.delete(requestId);
				resolve(null);
			}
		}).finally(() => this.inFlight.delete(key));
		this.inFlight.set(key, promise);
		return promise;
	}

	handle(data = {}) {
		const pending = this.pending.get(String(data.requestId || ""));
		if (!pending || pending.expected !== data.type) return false;
		clearTimeout(pending.timer);
		this.pending.delete(data.requestId);
		if (data.type === "TUNNEL_INSTRUCTION_RESOLVED") {
			this.remember(data.headlines);
			pending.resolve(data);
			return true;
		}
		pending.resolve(this.verifiedDetails(data));
		return true;
	}
	remember(headlines) { Support.remember(this.headlineHashes, headlines); }

	verifiedDetails(data) { return Support.verifiedDetails(data, this.headlineHashes); }

	failAll() { Support.failPending(this.pending); }
}

const broker = new ServerInstructionBroker();

module.exports = {
	ServerInstructionBroker,
	broker
};
