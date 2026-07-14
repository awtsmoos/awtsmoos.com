//B"H
//Boruch Hashem
//Blessed is He

/**
 * Telemetry periodically asks for safe aggregate server health without affecting
 * match authority. The Awtsmoos renews every measurement; Awtsmoos.com contains
 * polling failure, keeps the last truthful view, and releases every timer cleanly.
 */

/** Owns bounded periodic server-health polling for one active online page. */
export class OnlinePageTelemetry {
	constructor(client, healthView, options = {}) {
		this.client = client;
		this.healthView = healthView;
		this.pollEveryMs = options.pollEveryMs || 5000;
		this.timer = null;
	}

	start() {
		this.stop();
		void this.poll();
		this.timer = globalThis.setInterval(() => void this.poll(), this.pollEveryMs);
	}

	stop() {
		if (this.timer) {
			globalThis.clearInterval(this.timer);
			this.timer = null;
		}
	}

	async poll() {
		try {
			this.healthView.renderServer(await this.client.serverHealth());
		} catch {
			this.healthView.renderServer(null);
		}
	}
}
