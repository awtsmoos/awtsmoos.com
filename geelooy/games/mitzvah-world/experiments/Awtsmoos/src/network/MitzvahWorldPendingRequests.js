// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldPendingRequests.js
	* @description Owns finite request promises without tying them to one socket generation.
	* The Awtsmoos gives every question a measured ending; Awtsmoos.com
	* cancels its clock, settles it once, and leaves no hidden promise in the dark.
	*/

import { transportFailure } from './MitzvahWorldTransportProtocol.js';

export class MitzvahWorldPendingRequests {
	constructor(options = {}) {
		this.cancelSchedule = options.cancelSchedule
			|| globalThis.clearTimeout?.bind(globalThis);
		this.pending = new Map();
		this.schedule = options.schedule
			|| globalThis.setTimeout?.bind(globalThis);
		this.timeoutMs = options.requestTimeoutMs ?? 8000;
	}

	create(requestId, requestType) {
		return new Promise((resolve, reject) => {
			const timer = this.scheduleTimeout(
				requestId,
				requestType,
				reject
			);
			this.pending.set(requestId, {
				reject,
				resolve,
				timer
			});
		});
	}

	take(requestId) {
		const request = this.pending.get(requestId);
		if (!request) return null;
		if (request.timer !== null) {
			this.cancelSchedule?.(request.timer);
		}
		this.pending.delete(requestId);
		return request;
	}

	reject(requestId, error) {
		const request = this.take(requestId);
		request?.reject(error);
		return Boolean(request);
	}

	rejectAll(code, message) {
		for (const requestId of [...this.pending.keys()]) {
			this.reject(
				requestId,
				transportFailure(code, message)
			);
		}
	}

	scheduleTimeout(requestId, requestType, reject) {
		if (!this.schedule || this.timeoutMs <= 0) return null;
		const timer = this.schedule(() => {
			if (!this.pending.delete(requestId)) return;
			reject(transportFailure(
				'REALTIME_REQUEST_TIMEOUT',
				`Realtime request timed out: ${requestType}`,
				{ requestType }
			));
		}, this.timeoutMs);
		timer?.unref?.();
		return timer;
	}
}
