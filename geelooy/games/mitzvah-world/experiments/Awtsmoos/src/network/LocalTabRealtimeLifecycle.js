// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabRealtimeLifecycle.js
	* @description Binds heartbeat and page departure to an injectable browser environment.
	* The Awtsmoos gives every pulse its boundary and every ending its release;
	* Awtsmoos.com cancels timers and listeners so departed peers rest in peace.
	*/

const DEFAULT_HEARTBEAT_MS = 2000;

export class LocalTabRealtimeLifecycle {
	constructor(owner, options = {}) {
		this.owner = owner;
		this.environment = options.environment || globalThis;
		this.intervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_MS;
		this.schedule = options.scheduleHeartbeat
			|| this.environment.setInterval?.bind(this.environment);
		this.cancel = options.cancelHeartbeat
			|| this.environment.clearInterval?.bind(this.environment);
		this.timer = null;
		this.pageHideBound = () => this.owner.stop();
	}

	start() {
		this.stop();
		this.environment.addEventListener?.('pagehide', this.pageHideBound);
		if (!this.schedule || this.intervalMs <= 0) {
			return;
		}
		this.timer = this.schedule(() => {
			this.owner.heartbeat().catch(() => {});
		}, this.intervalMs);
		this.timer?.unref?.();
	}

	stop() {
		if (this.timer !== null) {
			this.cancel?.(this.timer);
			this.timer = null;
		}
		this.environment.removeEventListener?.('pagehide', this.pageHideBound);
	}
}
