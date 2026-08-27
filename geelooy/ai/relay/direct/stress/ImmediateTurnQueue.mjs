// B"H

/**
 * Tiny injected-service queue for deterministic fixtures. Production construction
 * never selects this vessel unless a caller explicitly supplies a fake service.
 */
export class ImmediateTurnQueue {
	constructor() { this.active = 0; }

	async acquire() {
		this.active += 1;
		let released = false;
		return {
			view: {
				leaseId: `fixture-${process.pid}-${Date.now()}`,
				queuedMs: 0,
				acquiredAt: new Date().toISOString(),
				minimumIntervalMs: 0,
				maxActiveTabs: 1
			},
			release: async () => {
				if (released) return false;
				released = true;
				this.active = Math.max(0, this.active - 1);
				return true;
			}
		};
	}

	status() {
		return { queued: 0, active: this.active, minimumIntervalMs: 0, maxActiveTabs: 1 };
	}
}
