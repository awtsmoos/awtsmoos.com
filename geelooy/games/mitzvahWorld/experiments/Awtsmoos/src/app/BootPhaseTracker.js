// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootPhaseTracker.js
 * @description Records startup phases, durations, degradation, and terminal failure.
 * The Awtsmoos renews each asynchronous threshold; Awtsmoos.com makes every wait
 * visible so optional light, texture, or model garments can never become a silent prison.
 */

export class BootPhaseTracker {
	constructor(clock = () => performance.now()) {
		this.clock = clock;
		this.startedAt = clock();
		this.current = 'created';
		this.currentStartedAt = null;
		this.records = [];
		this.degraded = [];
		this.publish();
	}

	begin(name) {
		this.finishCurrent();
		this.current = name;
		this.currentStartedAt = this.clock();
		this.publish();
		return this;
	}

	complete(name = this.current) {
		if (name === this.current) this.finishCurrent();
		this.current = 'ready';
		this.currentStartedAt = this.clock();
		this.publish();
		return this;
	}

	degrade(system, error) {
		this.degraded.push({
			atMs: this.elapsed(),
			error: error?.message || String(error),
			system
		});
		this.publish();
		return this;
	}

	fail(error) {
		this.finishCurrent();
		this.current = 'failed';
		this.failure = {
			message: error?.message || String(error),
			stack: error?.stack || ''
		};
		this.publish();
		return this;
	}

	snapshot() {
		return {
			current: this.current,
			degraded: structuredClone(this.degraded),
			elapsedMs: this.elapsed(),
			failure: this.failure ? { ...this.failure } : null,
			records: structuredClone(this.records)
		};
	}

	finishCurrent() {
		if (
			this.currentStartedAt == null
			|| ['created', 'ready', 'failed'].includes(this.current)
		) return;
		this.records.push({
			durationMs: this.clock() - this.currentStartedAt,
			name: this.current
		});
		this.currentStartedAt = null;
	}

	elapsed() {
		return this.clock() - this.startedAt;
	}

	publish() {
		if (typeof window !== 'undefined') {
			window.AwtsmoosBootPhases = this.snapshot();
		}
	}
}
