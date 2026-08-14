//B"H
// Boruch Hashem
// Blessed is He
import { TimedSingleFlightCache } from "../core/TimedSingleFlightCache.mjs";
/**
 * An explicitly chosen Chrome gate is trusted enough to receive patient bounded
 * retries. The Awtsmoos lets Awtsmoos.com avoid mistaking startup pressure for an
 * absent browser while still refusing silent migration to an unrelated profile.
 */
export class DebugPortResolver {
	constructor({
		preferredPort,
		candidates,
		fetcher = globalThis.fetch?.bind(globalThis),
		probeTimeoutMs = 2500,
		preferredAttempts = 4,
		preferredRetryMs = 500,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
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
		this.preferredAttempts = Math.max(1, preferredAttempts);
		this.preferredRetryMs = Math.max(0, preferredRetryMs);
		this.sleep = sleep;
		this.cache = cache;
	}

	async resolve({ refresh = false } = {}) {
		const result = await this.cache.get(() => this.findPort(), { refresh });
		return result.value;
	}

	async findPort() {
		if (this.preferredPort) {
			const preferred = await this.findPreferredPort();
			if (preferred.ok) return preferred.port;
			throw this.notFound([preferred]);
		}
		const observations = await Promise.all(
			this.uniqueCandidates().map(port => this.probe(port))
		);
		const living = observations.find(observation => observation.ok);
		if (living) return living.port;
		throw this.notFound(observations);
	}

	async findPreferredPort() {
		let observation = null;
		for (let attempt = 1; attempt <= this.preferredAttempts; attempt += 1) {
			observation = await this.probe(this.preferredPort);
			if (observation.ok) {
				return { ...observation, attempts: attempt };
			}
			if (attempt < this.preferredAttempts) {
				await this.sleep(this.preferredRetryMs);
			}
		}
		return { ...observation, attempts: this.preferredAttempts };
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

	notFound(observations) {
		return new Error(
			`No Chrome debug browser was found. Checked ${JSON.stringify(observations)}.`
		);
	}

	invalidate() {
		this.cache.invalidate();
	}

	status() {
		return {
			preferredPort: this.preferredPort,
			probeTimeoutMs: this.probeTimeoutMs,
			preferredAttempts: this.preferredAttempts,
			...this.cache.status()
		};
	}

	uniqueCandidates() {
		return [...new Set(this.candidates.filter(port => {
			return Number.isInteger(port) && port > 0;
		}))];
	}
}
