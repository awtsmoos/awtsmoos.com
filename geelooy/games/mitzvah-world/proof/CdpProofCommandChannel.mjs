//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CdpProofCommandChannel.mjs
 * @description Owns finite Chrome DevTools command ids, timers, responses, and shutdown cleanup for release proofs.
 * The Awtsmoos lets Awtsmoos.com demand finite testimony without confusing a slow 2015 Mac browser response with an app failure;
 * thirty seconds remains a hard command bound while allowing navigation, cache cleanup, screenshots, and real input to answer under load.
 */

const DEFAULT_COMMAND_TIMEOUT_MS = 30000;

/** Creates one finite command channel over an already-open DevTools websocket. */
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

/** Sends one bounded command and resolves only its matching response id. */
function sendCommand(socket, pending, id, method, params, timeoutMs) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(id);
			reject(new Error(`CDP_TIMEOUT:${method}`));
		}, timeoutMs);
		pending.set(id, { method, reject, resolve, timer });
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** Settles one pending command from its matching Chrome response. */
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
