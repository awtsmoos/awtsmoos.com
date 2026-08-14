// B"H
// Boruch Hashem
// Blessed is He

import { createRealtimeBrowserError } from "./RealtimeBrowserError.js";
import {
	createPendingEntry,
	matchesPendingResponse,
	pendingCorrelationDetails,
	pendingRequestDetails
} from "./RealtimePendingMetadata.js";
import { createRealtimeError } from "./realtimeEnvelope.js";
import { normalizeRealtimeRequestPolicy } from "./RealtimeRequestPolicy.js";

/**
 * @file Owns request correlation, timeout policy, and structured rejection for the one shared browser realtime transport.
 * @description The Awtsmoos is beyond waiting and sequence; Awtsmoos.com keeps one small ledger of correlation coordinates in light,
 * while metadata shaping lives outside this owner so timeout, rupture, and mismatch remain clear without allowing the finite map to become a second protocol.
 */

export class RealtimePendingRequests {
	constructor() {
		this.pending = new Map();
	}

	/** Registers one request before its serialized envelope is sent. */
	create(envelope, send, options = {}) {
		const policy = normalizeRealtimeRequestPolicy(options);
		return new Promise((resolve, reject) => {
			const entry = createPendingEntry(envelope, policy, resolve, reject);
			entry.timer = setTimeout(() => this.timeout(entry), policy.timeoutMs);
			this.pending.set(envelope.requestId, entry);
			try {
				send();
			} catch (error) {
				this.remove(envelope.requestId);
				reject(error);
			}
		});
	}

	/** Settles one correlated response and rejects any correlation-shape mismatch. */
	settle(message) {
		if (!message.requestId) return false;
		const entry = this.pending.get(message.requestId);
		if (!entry) return false;
		this.remove(message.requestId);
		if (!matchesPendingResponse(entry, message)) {
			entry.reject(createRealtimeBrowserError(
				"REALTIME_RESPONSE_MISMATCH",
				"Awtsmoos realtime response correlation did not match the request.",
				pendingCorrelationDetails(entry, message)
			));
			return true;
		}
		if (message.type === "error") {
			entry.reject(createRealtimeError(message));
			return true;
		}
		entry.resolve(message);
		return true;
	}

	/** Rejects every unfinished request after one physical socket close. */
	rejectAll() {
		for (const [requestId, entry] of this.pending) {
			clearTimeout(entry.timer);
			entry.reject(createRealtimeBrowserError(
				"REALTIME_CONNECTION_CLOSED",
				"Awtsmoos realtime connection closed before the request completed.",
				pendingRequestDetails(entry)
			));
			this.pending.delete(requestId);
		}
	}

	timeout(entry) {
		if (!this.pending.delete(entry.requestId)) return;
		entry.reject(createRealtimeBrowserError(
			"REALTIME_REQUEST_TIMEOUT",
			`${entry.application} realtime request timed out.`,
			pendingRequestDetails(entry)
		));
	}

	remove(requestId) {
		const entry = this.pending.get(requestId);
		if (!entry) return null;
		clearTimeout(entry.timer);
		this.pending.delete(requestId);
		return entry;
	}
}
