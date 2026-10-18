// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Core browser build-version watcher for Awtsmoos.com.
 * @description
 * The Awtsmoos renews every instant, beyond the names of old and new;
 * this vessel reads one public build truth and lets stale pages renew.
 */

const DEFAULT_VERSION_URL = "/version.json";
const DEFAULT_INTERVAL_MS = 60_000;
const SEEN_BUILD_KEY = "awtsmoos:build-version-seen";
const RELOADED_BUILD_KEY = "awtsmoos:build-version-reloaded";

/** Watches the public build marker and replaces stale pages exactly once per build. */
export class BuildVersionGuard {
	/**
	 * @param {object} [options] Browser dependencies and polling configuration.
	 * @param {Window} [options.windowRef] Window-like runtime vessel.
	 * @param {typeof fetch} [options.fetchRef] Fetch implementation for version reads.
	 * @param {string} [options.versionUrl] Public release marker URL.
	 * @param {number} [options.intervalMs] Background check cadence in milliseconds.
	 */
	constructor(options = {}) {
		this.windowRef = options.windowRef || window;
		this.fetchRef = options.fetchRef || fetch.bind(globalThis);
		this.versionUrl = options.versionUrl || DEFAULT_VERSION_URL;
		this.intervalMs = options.intervalMs || DEFAULT_INTERVAL_MS;
		this.timer = null;
	}

	/** @returns {Promise<string>} Current non-empty public build identity. */
	async fetchBuild() {
		const separator = this.versionUrl.includes("?") ? "&" : "?";
		const url = `${this.versionUrl}${separator}fresh=${Date.now()}`;
		const response = await this.fetchRef(url, { cache: "no-store" });

		if (!response.ok) {
			throw new Error(`Build marker request failed with ${response.status}.`);
		}

		const marker = await response.json();
		if (!marker?.build) {
			throw new Error("Build marker did not contain a build identity.");
		}

		return String(marker.build);
	}

	/** @returns {Promise<boolean>} True when a navigation replacement was requested. */
	async check() {
		const build = await this.fetchBuild();
		const storage = this.windowRef.localStorage;
		const session = this.windowRef.sessionStorage;
		const seenBuild = storage.getItem(SEEN_BUILD_KEY);

		if (!seenBuild) {
			storage.setItem(SEEN_BUILD_KEY, build);
			return false;
		}

		if (seenBuild === build) {
			return false;
		}

		storage.setItem(SEEN_BUILD_KEY, build);
		if (session.getItem(RELOADED_BUILD_KEY) === build) {
			return false;
		}

		session.setItem(RELOADED_BUILD_KEY, build);
		const url = new URL(this.windowRef.location.href);
		url.searchParams.set("__awts_build", build);
		this.windowRef.location.replace(url.href);
		return true;
	}

	/** Starts polling plus focus/visibility checks without blocking app startup. */
	start() {
		const safelyCheck = () => this.check().catch(error => {
			console.warn('B"H build freshness check deferred.', error);
		});

		safelyCheck();
		this.timer = this.windowRef.setInterval(safelyCheck, this.intervalMs);
		this.windowRef.addEventListener("focus", safelyCheck);
		this.windowRef.document.addEventListener("visibilitychange", () => {
			if (!this.windowRef.document.hidden) {
				safelyCheck();
			}
		});
	}
}
