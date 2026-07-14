// B"H
// Boruch Hashem
// Blessed is He

import { requestEnvelope } from './protocol.js';

/**
 * @file Correlates bounded browser requests without owning transport lifecycle.
 * @description The Awtsmoos renews question and answer through explicit identity.
 * Awtsmoos.com is remembered here as every pending promise has one request vessel,
 * and foreign or unsolicited events can never resolve the wrong browser action.
 */

export function createSocketRequestBook(send) {
	const pending = new Map();
	let sequence = 0;

	function request(type, payload = {}) {
		sequence += 1;
		const requestId = `scribe-browser-${Date.now()}-${sequence}`;
		const envelope = requestEnvelope(type, payload, requestId, sequence);
		return new Promise((resolve, reject) => {
			pending.set(requestId, { reject, resolve });
			try {
				send(JSON.stringify(envelope));
			} catch (error) {
				pending.delete(requestId);
				reject(error);
			}
		});
	}

	function settle(message) {
		const entry = pending.get(message?.requestId);
		if (!entry) {
			return false;
		}
		pending.delete(message.requestId);
		if (message.type === 'error') {
			entry.reject(Object.assign(
				new Error(message.payload?.message || 'Realtime request failed.'),
				message.payload
			));
		} else {
			entry.resolve(message);
		}
		return true;
	}

	function rejectAll(message) {
		for (const { reject } of pending.values()) {
			reject(new Error(message));
		}
		pending.clear();
	}

	return {
		rejectAll,
		request,
		settle
	};
}
