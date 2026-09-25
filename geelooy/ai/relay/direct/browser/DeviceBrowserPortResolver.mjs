//B"H
//Boruch Hashem
//Blessed is He

import { createRequire } from "node:module";
import { TimedSingleFlightCache } from "../core/TimedSingleFlightCache.mjs";

const require = createRequire(import.meta.url);
const Registry = require("../../split-browser/deviceBrowserRegistry.cjs");
const Chrome = require("../../split-browser/cdpChrome.cjs");

/**
 * @file Resolves the live DevTools endpoint only through device browser authority.
 * A streak of failed launches engages a launch circuit breaker: launches stop
 * for a cooldown window and the resolver fails cheap (observation plus a fast
 * probe only), so hot sweeps never turn a dead browser into a launch storm.
 */
export class DeviceBrowserPortResolver {
	constructor(options = {}) {
		this.registry = options.registry || Registry;
		this.browserStarter = options.browserStarter || (config => Chrome.openDebugChrome(config));
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.probeTimeoutMs = Math.max(250, Number(options.probeTimeoutMs || 2500));
		this.cache = options.cache || new TimedSingleFlightCache({ ttlMs: 5000 });
		this.authority = null;
		this.now = options.now || (() => Date.now());
		this.launchFailureThreshold = Math.max(1, Number(options.launchFailureThreshold || 3));
		this.launchCooldownMs = Math.max(1000, Number(options.launchCooldownMs || 60000));
		this.launchFailures = 0;
		this.launchSuppressedUntil = 0;
	}

	/** Returns the current verified endpoint, restoring Chrome only when necessary. */
	async resolve({ refresh = false } = {}) {
		const result = await this.cache.get(() => this.findPort(), { refresh });
		return result.value;
	}

	/** Validates registry testimony, then performs one bounded same-profile recovery. */
	async findPort() {
		let authority = await this.registry.observe();
		if (authority.ok && await this.probe(authority)) {
			this.noteLaunchSuccess();
			this.authority = authority;
			return authority.port;
		}
		const now = this.now();
		if (now < this.launchSuppressedUntil) {
			throw this.notFound({ status: "device_browser_launch_suppressed",
				launchFailures: this.launchFailures, suppressedUntil: this.launchSuppressedUntil });
		}
		let started;
		try {
			started = await this.browserStarter({});
		} catch (error) {
			this.noteLaunchFailure(now);
			throw this.notFound({ launchError: String(error?.code || error?.message || error) });
		}
		if (!started?.ok) {
			this.noteLaunchFailure(now);
			throw this.notFound(started);
		}
		authority = await this.registry.observe();
		if (!authority.ok || !await this.probe(authority)) {
			this.noteLaunchFailure(now);
			throw this.notFound({ started, authority });
		}
		this.noteLaunchSuccess();
		this.authority = authority;
		return authority.port;
	}

	/** Proves the registered host and port answer as a Chrome DevTools browser. */
	async probe(authority = {}) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.probeTimeoutMs);
		try {
			const response = await this.fetcher(`http://${authority.host}:${authority.port}/json/version`,
				{ signal: controller.signal });
			if (!response.ok) return false;
			const version = await response.json();
			return typeof version.webSocketDebuggerUrl === "string";
		} catch {
			return false;
		} finally {
			clearTimeout(timeout);
		}
	}

	/** Stops launch attempts until the given timestamp (watchdog circuit breaker). */
	suppressLaunches(untilMs) {
		this.launchSuppressedUntil = Math.max(this.launchSuppressedUntil, Number(untilMs) || 0);
	}

	/** Re-enables launch attempts immediately and clears the failure streak. */
	clearLaunchSuppression() {
		this.launchSuppressedUntil = 0;
		this.launchFailures = 0;
	}

	noteLaunchFailure(now) {
		this.launchFailures += 1;
		if (this.launchFailures >= this.launchFailureThreshold) this.launchSuppressedUntil = now + this.launchCooldownMs;
	}

	noteLaunchSuccess() {
		this.launchFailures = 0;
		this.launchSuppressedUntil = 0;
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
			launchFailures: this.launchFailures,
			launchSuppressedUntil: this.launchSuppressedUntil || null,
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
