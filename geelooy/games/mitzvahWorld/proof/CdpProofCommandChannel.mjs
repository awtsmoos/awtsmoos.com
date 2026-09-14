//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CdpProofCommandChannel.mjs
 * @description Owns bounded Chrome DevTools command ids, timers, responses, and shutdown cleanup for release proofs.
 * A release witness must fail clearly when browser control stalls instead of waiting forever and hiding the real product state.
 */

const DEFAULT_COMMAND_TIMEOUT_MS = 12000;

/**
 * Creates one finite command channel over an already-open DevTools websocket.
 * @param {WebSocket} socket Connected Chrome DevTools websocket owned by the caller.
 * @param {{timeoutMs?: number}} [options] Optional command-response deadline policy.
 * @returns {{command: Function, resolve: Function, close: Function}} Bounded command lifecycle API.
 */
export function createCdpProofCommandChannel(socket, options = {}) {
	const timeoutMs = finiteTimeout(options.timeoutMs);
	const pending = new Map();
	let sequence = 1;

	return {
		command(method, params = {}) {
			return sendCommand(socket, pending, sequence++, method, params, timeoutMs);
		},
		resolve(message) {
			return resolveCommand(pending, message);
		},
		close(reason = 'CDP_SESSION_CLOSED') {
			closePending(pending, reason);
		}
	};
}

/** Resolves a valid positive command timeout while rejecting unusable configuration values. */
function finiteTimeout(value) {
	return Number.isFinite(value) && value > 0
		? value
		: DEFAULT_COMMAND_TIMEOUT_MS;
}

/**
 * Sends one command, records its timeout, and resolves only the matching response id.
 * @param {WebSocket} socket Connected protocol transport.
 * @param {Map<number, object>} pending Pending request ledger.
 * @param {number} id Monotonic DevTools request id.
 * @param {string} method Chrome DevTools protocol method.
 * @param {object} params Serializable method parameters.
 * @param {number} timeoutMs Maximum response wait in milliseconds.
 * @returns {Promise<object>} Exact DevTools result object.
 */
function sendCommand(socket, pending, id, method, params, timeoutMs) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(id);
			reject(new Error(`CDP_TIMEOUT:${method}`));
		}, timeoutMs);
		pending.set(id, {
			method,
			reject,
			resolve,
			timer
		});
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/**
 * Settles one pending command from its matching Chrome response.
 * @param {Map<number, object>} pending Pending request ledger.
 * @param {object} message Parsed DevTools message.
 * @returns {boolean} Whether this message resolved a known request.
 */
function resolveCommand(pending, message) {
	if (!message.id) return false;
	const request = pending.get(message.id);
	if (!request) return false;
	clearTimeout(request.timer);
	pending.delete(message.id);
	if (message.error) {
		request.reject(new Error(JSON.stringify(message.error)));
		return true;
	}
	request.resolve(message.result || {});
	return true;
}

/** Rejects and clears all outstanding commands when their owning session closes. */
function closePending(pending, reason) {
	for (const request of pending.values()) {
		clearTimeout(request.timer);
		request.reject(new Error(reason));
	}
	pending.clear();
}
