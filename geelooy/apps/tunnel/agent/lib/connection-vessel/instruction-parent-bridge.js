//B"H // Boruch Hashem // Blessed is He

const { randomUUID } = require("node:crypto");
const Protocol = require("./protocol.js");

/**
 * @file Carries parent instruction calls into the one child that owns the relay socket.
 * @description The Awtsmoos keeps one authenticated server voice while Awtsmoos.com lets
 * parent-resident actions hear it through fenced IPC, never by opening a rival connection.
 */
function create(options = {}) {
	const pending = new Map();
	const timeoutMs = Math.max(1000, Number(options.timeoutMs || 15000));

	function request(operation, payload = {}) {
		const requestId = randomUUID();
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				pending.delete(requestId);
				reject(new Error("instruction_child_timeout"));
			}, timeoutMs);
			pending.set(requestId, { reject, resolve, timer });
			const sent = options.notify?.(Protocol.message(Protocol.TYPES.INSTRUCTION_REQUEST, {
				operation: String(operation || ""),
				payload,
				requestId
			}));
			if (sent === false) rejectOne(requestId, "instruction_child_unavailable");
		});
	}

	function settle(message = {}) {
		const requestId = String(message.requestId || "");
		const entry = pending.get(requestId);
		if (!entry) return false;
		pending.delete(requestId);
		clearTimeout(entry.timer);
		if (message.ok === false) {
			entry.reject(new Error(String(message.error || "instruction_child_failed")));
		} else {
			entry.resolve(message.result);
		}
		return true;
	}

	function rejectOne(requestId, code) {
		const entry = pending.get(requestId);
		if (!entry) return false;
		pending.delete(requestId);
		clearTimeout(entry.timer);
		entry.reject(new Error(code));
		return true;
	}

	function rejectAll(code = "instruction_child_replaced") {
		for (const requestId of [...pending.keys()]) rejectOne(requestId, code);
	}

	return { rejectAll, request, settle };
}

module.exports = { create };
