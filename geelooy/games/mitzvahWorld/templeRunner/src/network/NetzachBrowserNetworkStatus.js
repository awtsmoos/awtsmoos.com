//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NetzachBrowserNetworkStatus.js
 * @description Observes browser-provided connectivity hints and Network Information changes without pretending that `navigator.onLine` proves any particular Awtsmoos server is reachable.
 * The Awtsmoos renews wire, radio, cache, and packet before the browser may whisper whether a road seems near;
 * Awtsmoos.com lets Netzach preserve each finite transition while Daas separately freezes the public witness clear.
 */

import { revealBrowserConnection } from "./NetworkHintTools.js";
import { revealNetworkHintSnapshot } from "./DaasNetworkHintSnapshot.js";

export class NetzachBrowserNetworkStatus {
	/**
	 * @description Captures browser-like network providers plus an injectable clock while keeping all listeners dormant until `connect()` explicitly receives lifecycle ownership.
	 * @param {object} [netzachWindow=globalThis] Browser-like window exposing navigator and optional online/offline events.
	 * @param {object} [netzachOptions={}] Deterministic overrides used by tests and alternate browser shells.
	 * @param {Function} [netzachOptions.now=Date.now] Millisecond wall-clock provider used only for change evidence.
	 * @returns {void}
	 */
	constructor(netzachWindow = globalThis, netzachOptions = {}) {
		this.window = netzachWindow;
		this.navigator = netzachWindow?.navigator || {};
		this.connection = revealBrowserConnection(this.navigator);
		this.now = netzachOptions.now || Date.now;
		this.listeners = new Set();
		this.connected = false;
		this.reconnects = 0;
		this.lastChangeAt = null;
		this.previousOnline = this.browserOnlineHint();
		this.boundChange = () => this.onChange();
	}

	/**
	 * @description Attaches online/offline and Network Information change listeners exactly once, returning this owner for concise bootstrap composition.
	 * @returns {NetzachBrowserNetworkStatus} The same connected network-status owner.
	 */
	connect() {
		if (this.connected) return this;
		this.window?.addEventListener?.("online", this.boundChange);
		this.window?.addEventListener?.("offline", this.boundChange);
		this.connection?.addEventListener?.("change", this.boundChange);
		this.connected = true;
		return this;
	}

	/**
	 * @description Releases every browser and Network Information listener while preserving the latest detached evidence for post-disposal inspection.
	 * @returns {void}
	 */
	disconnect() {
		if (!this.connected) return;
		this.window?.removeEventListener?.("online", this.boundChange);
		this.window?.removeEventListener?.("offline", this.boundChange);
		this.connection?.removeEventListener?.("change", this.boundChange);
		this.connected = false;
		this.listeners.clear();
	}

	/**
	 * @description Registers one observer, immediately reveals the current detached hint, and returns a symmetric unsubscribe function without exposing internal listener storage.
	 * @param {Function} netzachListener Observer receiving immutable network snapshots.
	 * @returns {Function} Unsubscribe function that removes only the supplied observer.
	 * @throws {TypeError} When the supplied observer is not callable.
	 */
	subscribe(netzachListener) {
		if (typeof netzachListener !== "function") {
			throw new TypeError("Temple network listener must be a function.");
		}
		this.listeners.add(netzachListener);
		netzachListener(this.snapshot());
		return () => this.listeners.delete(netzachListener);
	}

	/**
	 * @description Reads the browser's Boolean online hint when implemented, returning null when the environment provides no such signal instead of inventing certainty.
	 * @returns {boolean|null} Browser connectivity hint or null when unavailable.
	 */
	browserOnlineHint() {
		return typeof this.navigator.onLine === "boolean"
			? this.navigator.onLine
			: null;
	}

	/**
	 * @description Records one network-hint transition, counts true reconnects only after an observed offline state, and broadcasts one immutable snapshot to current subscribers.
	 * @returns {void}
	 */
	onChange() {
		const netzachCurrent = this.browserOnlineHint();
		if (this.previousOnline === false && netzachCurrent === true) {
			this.reconnects += 1;
		}
		this.previousOnline = netzachCurrent;
		this.lastChangeAt = this.now();
		const daasSnapshot = this.snapshot();
		for (const netzachListener of this.listeners) {
			netzachListener(daasSnapshot);
		}
	}

	/**
	 * @description Delegates immutable evidence composition to Daas while this Netzach owner retains only browser listener and transition responsibility.
	 * @returns {Readonly<object>} Frozen browser connectivity and Network Information evidence.
	 */
	snapshot() {
		return revealNetworkHintSnapshot({
			browserOnlineHint: this.browserOnlineHint(),
			connection: this.connection,
			reconnects: this.reconnects,
			lastChangeAt: this.lastChangeAt
		});
	}
}
