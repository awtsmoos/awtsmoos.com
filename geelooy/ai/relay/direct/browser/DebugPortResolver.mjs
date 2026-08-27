// B"H
// Boruch Hashem
// Blessed is He

import { TimedSingleFlightCache } from "../core/TimedSingleFlightCache.mjs";

/**
 * @file Resolves and remembers the authenticated Chrome profile's actual owner port.
 * @description
 * The Awtsmoos accepts Chrome's singleton truth once. When starter redirects 9224 to
 * the profile already living on 9223, Awtsmoos.com promotes 9223 to the active port;
 * watchdog refreshes then probe it directly and never reconcile an in-flight tab.
 */
export class DebugPortResolver {
	constructor(options = {}) {
		this.requestedPort = Number(options.preferredPort || 0) || null;
		this.activePort = this.requestedPort;
		this.candidates = options.candidates ?? [this.requestedPort, 9223, 9224];
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.browserStarter = options.browserStarter || null;
		this.probeTimeoutMs = Number(options.probeTimeoutMs || 2500);
		this.preferredAttempts = Math.max(1, Number(options.preferredAttempts || 20));
		this.preferredRetryMs = Math.max(0, Number(options.preferredRetryMs || 250));
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.cache = options.cache || new TimedSingleFlightCache({ ttlMs: 30000 });
	}

	async resolve({ refresh = false } = {}) {
		const result = await this.cache.get(() => this.findPort(), { refresh });
		this.promote(result.value);
		return result.value;
	}

	async findPort() {
		if (this.activePort) return this.findActivePort();
		const observations = await Promise.all(this.uniqueCandidates().map(port => this.probe(port)));
		const living = observations.find(observation => observation.ok);
		if (living) return living.port;
		throw this.notFound(observations);
	}

	async findActivePort() {
		let observation = await this.probe(this.activePort);
		if (observation.ok) return observation.port;
		let start = null;
		if (this.browserStarter) {
			try { start = await this.browserStarter(this.activePort); }
			catch (error) { start = { ok: false, error: error.message }; }
		}
		const redirectedPort = Number(start?.debugPort || 0) || null;
		if (redirectedPort) {
			observation = await this.probe(redirectedPort);
			if (observation.ok) {
				this.promote(observation.port);
				return observation.port;
			}
		}
		for (let attempt = 2; attempt <= this.preferredAttempts; attempt += 1) {
			await this.sleep(this.preferredRetryMs);
			observation = await this.probe(redirectedPort || this.activePort);
			if (observation.ok) {
				this.promote(observation.port);
				return observation.port;
			}
		}
		throw this.notFound([{ ...observation, attempts: this.preferredAttempts, start }]);
	}

	async probe(port) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.probeTimeoutMs);
		try {
			const response = await this.fetcher(`http://127.0.0.1:${port}/json/version`, {
				signal: controller.signal
			});
			if (!response.ok) return { port, ok: false, status: response.status };
			const version = await response.json();
			return { port, ok: typeof version.webSocketDebuggerUrl === "string", status: "online" };
		} catch (error) {
			return { port, ok: false,
				status: error?.name === "AbortError" ? "timeout" : "offline" };
		} finally {
			clearTimeout(timeout);
		}
	}

	promote(port) {
		if (!Number.isInteger(Number(port)) || Number(port) <= 0) return;
		this.activePort = Number(port);
		this.candidates = [this.activePort, ...this.candidates.filter(item => item !== this.activePort)];
	}

	notFound(observations) {
		const error = new Error(`No dedicated Chrome debug browser was found: ${JSON.stringify(observations)}.`);
		error.code = "dedicated_debug_browser_unavailable";
		return error;
	}

	invalidate() { this.cache.invalidate(); }

	status() {
		return {
			requestedPort: this.requestedPort,
			activePort: this.activePort,
			probeTimeoutMs: this.probeTimeoutMs,
			preferredAttempts: this.preferredAttempts,
			browserStarter: Boolean(this.browserStarter),
			...this.cache.status()
		};
	}

	uniqueCandidates() {
		return [...new Set(this.candidates.filter(port => Number.isInteger(port) && port > 0))];
	}
}
