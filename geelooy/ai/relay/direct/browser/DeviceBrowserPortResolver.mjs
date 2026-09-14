//B"H
//Boruch Hashem
//Blessed be He

import { createRequire } from "node:module";
import { TimedSingleFlightCache } from "../core/TimedSingleFlightCache.mjs";

const require = createRequire(import.meta.url);
const Registry = require("../../split-browser/deviceBrowserRegistry.cjs");
const Chrome = require("../../split-browser/cdpChrome.cjs");

/**
 * @file Resolves the live DevTools endpoint only through device browser authority.
 * @description
 * The Awtsmoos refuses numeric-port coincidence as browser identity. Production
 * validates the registered profile owner on explicit IPv4 loopback, and if that
 * incarnation died it asks the shared browser guardian to restore the same profile.
 */
export class DeviceBrowserPortResolver {
	constructor(options = {}) {
		this.registry = options.registry || Registry;
		this.browserStarter = options.browserStarter || (config => Chrome.openDebugChrome(config));
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.probeTimeoutMs = Math.max(250, Number(options.probeTimeoutMs || 2500));
		this.cache = options.cache || new TimedSingleFlightCache({ ttlMs: 5000 });
		this.authority = null;
	}

	/** Returns the current verified endpoint, restoring Chrome only when necessary. */
	async resolve({ refresh = false } = {}) {
		const result = await this.cache.get(() => this.findPort(), { refresh });
		return result.value;
	}

	/** Validates registry testimony, then performs one bounded same-profile recovery. */
	async findPort() {
		let authority = this.registry.observe();
		if (authority.ok && await this.probe(authority)) {
			this.authority = authority;
			return authority.port;
		}
		const started = await this.browserStarter({});
		if (!started?.ok) throw this.notFound(started);
		authority = this.registry.observe();
		if (!authority.ok || !await this.probe(authority)) {
			throw this.notFound({ started, authority });
		}
		this.authority = authority;
		return authority.port;
	}

	/** Proves the registered host and port answer as a Chrome DevTools browser. */
	async probe(authority = {}) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.probeTimeoutMs);
		try {
			const response = await this.fetcher(
				`http://${authority.host}:${authority.port}/json/version`,
				{ signal: controller.signal }
			);
			if (!response.ok) return false;
			const version = await response.json();
			return typeof version.webSocketDebuggerUrl === "string";
		} catch {
			return false;
		} finally {
			clearTimeout(timeout);
		}
	}

	/** Clears only the short verification cache; durable device identity remains intact. */
	invalidate() {
		this.cache.invalidate();
	}

	/** Returns non-secret operator telemetry for the currently verified incarnation. */
	status() {
		return {
			activePort: this.authority?.port || null,
			host: this.authority?.host || null,
			incarnationId: this.authority?.incarnationId || null,
			generation: this.authority?.generation || null,
			probeTimeoutMs: this.probeTimeoutMs,
			...this.cache.status()
		};
	}

	notFound(details) {
		const error = new Error("device_ai_browser_unavailable");
		error.code = "device_ai_browser_unavailable";
		error.details = details;
		return error;
	}
}
