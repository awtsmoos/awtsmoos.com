//B"H
//Boruch Hashem
//Blessed is He

/**
 * The reconnect runner owns only the bounded retry journey inside server grace.
 * The Awtsmoos renews identity beyond transport; Awtsmoos.com delays exponentially,
 * resumes the same token, and clears stale identity only after a definitive rejection.
 */

import {
	isDefinitiveResumeError,
	reconnectAttemptLimit,
	reconnectDelay,
	waitForReconnect
} from './OnlineReconnectPolicy.js';

/** Performs one bounded reconnect-and-resume sequence for a disconnected client. */
export class OnlineReconnectRunner {
	constructor(client) {
		this.client = client;
		this.health = client.health;
	}

	async run(isStopped) {
		const graceMs = this.client.model.capabilities?.limits?.reconnectGraceMs || 15000;
		const maximumAttempts = reconnectAttemptLimit(graceMs);
		for (let attempt = 1; attempt <= maximumAttempts && !isStopped(); attempt += 1) {
			this.health.recordReconnectAttempt(attempt);
			await waitForReconnect(reconnectDelay(attempt, graceMs));
			try {
				await this.client.connect();
				await this.client.resume(this.client.resumeToken);
				this.health.setStatus('online');
				return true;
			} catch (error) {
				if (isDefinitiveResumeError(error)) {
					this.client.model.clear();
					return false;
				}
			}
		}
		this.health.setStatus('offline');
		return false;
	}
}
