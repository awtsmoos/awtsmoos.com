// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldReconnectLoop.js
	* @description Schedules one finite, cancellable reconnect attempt at a time.
	* The Awtsmoos measures patience without multiplying abandoned promises;
	* Awtsmoos.com exposes the active attempt and closes the ladder at exhaustion.
	*/

export class MitzvahWorldReconnectLoop {
	constructor(backoff, options = {}) {
		this.backoff = backoff;
		this.cancelSchedule = options.cancelSchedule
			|| globalThis.clearTimeout?.bind(globalThis);
		this.maximumAttempts = options.maximumAttempts ?? 8;
		this.schedule = options.schedule
			|| globalThis.setTimeout?.bind(globalThis);
		this.attempt = 0;
		this.pendingReconnect = null;
		this.scheduled = null;
		this.stopped = false;
	}

	start(run, onFailure, onExhausted) {
		if (this.stopped || this.scheduled !== null) return null;
		if (this.pendingReconnect) return null;
		if (this.attempt >= this.maximumAttempts) {
			onExhausted();
			return null;
		}
		const delay = this.backoff.delayFor(this.attempt);
		this.attempt += 1;
		this.scheduled = this.schedule(() => {
			this.scheduled = null;
			this.runAttempt(run, onFailure);
		}, delay);
		this.scheduled?.unref?.();
		return delay;
	}

	runAttempt(run, onFailure) {
		let failure = null;
		const operation = Promise.resolve().then(run);
		this.pendingReconnect = operation;
		operation.catch(error => {
			failure = error;
		}).finally(() => {
			if (this.pendingReconnect === operation) {
				this.pendingReconnect = null;
			}
			if (failure && !this.stopped) {
				onFailure(failure);
			}
		});
		return operation;
	}

	succeed() {
		this.attempt = 0;
	}

	resume() {
		this.stopped = false;
	}

	stop() {
		this.stopped = true;
		if (this.scheduled !== null) {
			this.cancelSchedule?.(this.scheduled);
		}
		this.scheduled = null;
	}
}
