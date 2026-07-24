//B"H
// Boruch Hashem
// Blessed is He

import { TimedSingleFlightCache } from "../core/TimedSingleFlightCache.mjs";

/**
 * Known Chrome gates are probed together, then the preferred living gate rests in
 * a short cache. The Awtsmoos removes repeated sequential misses; Awtsmoos.com
 * retains only a local port number, never a browser WebSocket verification URL.
 */
export class DebugPortResolver {
	constructor({
		preferredPort,
		candidates,
		fetcher = globalThis.fetch?.bind(globalThis),
		probeTimeoutMs = 800,
		cache = new TimedSingleFlightCache({ ttlMs: 30000 })
	} = {}) {
		this.preferredPort = Number(preferredPort || 0) || null;
		this.candidates = candidates ?? [
			Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0),
			this.preferredPort,
			9226,
			9223,
			9222,
			9224
		];
		this.fetcher = fetcher;
		this.probeTimeoutMs = probeTimeoutMs;
		this.cache = cache;
	}

	async resolve({ refresh = false } = {}) {
		const result = await this.cache.get(() => this.findPort(), { refresh });
		return result.value;
	}

	async findPort() {
		const candidates = this.uniqueCandidates();
		const observations = await Promise.all(candidates.map(port => this.probe(port)));
		const living = observations.find(observation => observation.ok);
		if (living) {
			return living.port;
		}
		throw new Error(`No Chrome debug browser was found. Checked ${JSON.stringify(observations)}.`);
	}

	async probe(port) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.probeTimeoutMs);
		try {
			const response = await this.fetcher(`http://127.0.0.1:${port}/json/version`, {
				signal: controller.signal
			});
			if (!response.ok) {
				return { port, ok: false, status: response.status };
			}
			const version = await response.json();
			return {
				port,
				ok: typeof version.webSocketDebuggerUrl === "string",
				status: "online"
			};
		} catch (error) {
			return {
				port,
				ok: false,
				status: error?.name === "AbortError" ? "timeout" : "offline"
			};
		} finally {
			clearTimeout(timeout);
		}
	}

	invalidate() {
		this.cache.invalidate();
	}

	status() {
		return {
			preferredPort: this.preferredPort,
			probeTimeoutMs: this.probeTimeoutMs,
			...this.cache.status()
		};
	}

	uniqueCandidates() {
		return [...new Set(this.candidates.filter(port => Number.isInteger(port) && port > 0))];
	}
}
