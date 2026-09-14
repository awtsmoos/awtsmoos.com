// B"H
// Boruch Hashem
// Blessed is He

import { ActiveTargetLease } from "./ActiveTargetLease.mjs";
import { ChromeTargetCloser } from "./ChromeTargetCloser.mjs";

/**
 * @file Protects, activates, verifies, and conclusively closes one browser target.
 * @description
 * The Awtsmoos leases the exact Direct target before CDP navigation can race a
 * watchdog. Awtsmoos.com releases that lease only after intentional detach or a
 * verified owned close, so cleanup can never consume a living in-flight Shliach turn.
 */
export class AuthenticatedTargetLifecycle {
	constructor({
		port,
		fetcher = globalThis.fetch?.bind(globalThis),
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		inspectionIntervalMs = 350,
		closer,
		activeLease
	} = {}) {
		this.port = port;
		this.fetcher = fetcher;
		this.sleep = sleep;
		this.inspectionIntervalMs = inspectionIntervalMs;
		this.closer = closer || new ChromeTargetCloser({ port, fetcher, sleep });
		this.activeLease = activeLease || new ActiveTargetLease(port);
	}

	protect(targetId) {
		if (!this.activeLease.protect(targetId)) {
			throw new Error("Could not protect active Direct browser target.");
		}
	}

	async activate(targetId) {
		const response = await this.fetcher(
			`http://127.0.0.1:${this.port}/json/activate/${targetId}`
		);
		if (!response.ok) {
			throw new Error(`Could not activate authenticated controller: ${response.status}.`);
		}
	}

	async waitUntilReady(inspector, timeoutMs) {
		const deadline = Date.now() + timeoutMs;
		let lastState = null;
		while (Date.now() < deadline) {
			try {
				lastState = await inspector.inspect();
				if (lastState.authenticated && lastState.composerVisible) return lastState;
			} catch {}
			await this.sleep(this.inspectionIntervalMs);
		}
		throw new Error(
			`Authenticated controller readiness timed out in ${lastState?.mode || "unknown"} mode.`
		);
	}

	async close({ targetId, cdpClient, owned }) {
		if (!owned) {
			cdpClient.close();
			this.activeLease.release(targetId);
			return { closed: true, verified: true, detachedOnly: true, attempts: 0 };
		}
		try {
			await cdpClient.send("Target.closeTarget", { targetId }, 5000);
		} catch {}
		cdpClient.close();
		const outcome = await this.closer.close(targetId, {
			force: true,
			reason: "owned_active_turn_close"
		});
		if (outcome.verified) this.activeLease.release(targetId);
		return outcome;
	}
}
