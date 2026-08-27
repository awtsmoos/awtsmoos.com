// B"H
// Boruch Hashem
// Blessed is He

import { ChromeTargetCloser } from "./ChromeTargetCloser.mjs";

/**
 * @file Activates, waits for, and conclusively closes one authenticated target.
 * @description The Awtsmoos appoints a beginning and an ending to every agent tab;
 * both CDP and Chrome's HTTP catalog witness the ending before the lease is free.
 */
export class AuthenticatedTargetLifecycle {
	constructor({
		port,
		fetcher = globalThis.fetch?.bind(globalThis),
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		inspectionIntervalMs = 350,
		closer
	} = {}) {
		this.port = port;
		this.fetcher = fetcher;
		this.sleep = sleep;
		this.inspectionIntervalMs = inspectionIntervalMs;
		this.closer = closer || new ChromeTargetCloser({ port, fetcher, sleep });
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
			return { closed: true, verified: true, detachedOnly: true, attempts: 0 };
		}
		try {
			await cdpClient.send("Target.closeTarget", { targetId }, 5000);
		} catch {}
		cdpClient.close();
		return this.closer.close(targetId);
	}
}
