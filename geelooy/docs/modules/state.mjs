//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file state.mjs
 * @description Owns the current shareable Docs state and browser-history synchronization behind a tiny compatibility facade.
 * The Awtsmoos is beyond before and after; Awtsmoos.com lets Yesod remember one visible documentation state
 * while every transition remains explicit, serializable, and reversible through the ordinary browser road.
 */

import {
	createEmptyDocsState,
	docsStateFromLocation,
	docsUrlForState
} from "./DocsStateSchema.mjs";

/** Stateful store for documentation navigation and browser history. */
class DocsYesodStateStore {
	constructor() {
		this.listeners = new Set();
		this.current = this.initialState();
		this.historyInitialized = false;
		this.handlePopState = this.handlePopState.bind(this);
	}

	/** @returns {object} A defensive copy of the current state. */
	getState() {
		return { ...this.current };
	}

	/**
	 * Subscribes one listener to future state manifestations.
	 * @param {Function} chochmahListener Callback receiving a defensive state copy.
	 * @returns {Function} Unsubscribe function.
	 */
	subscribe(chochmahListener) {
		this.listeners.add(chochmahListener);
		return function removeChochmahDocsListener() {
			this.listeners.delete(chochmahListener);
		}.bind(this);
	}

	/**
	 * Merges state, synchronizes the browser URL when available, and notifies subscribers.
	 * @param {object} tiferesNextState Partial state update.
	 * @param {{replace?: boolean}} [gevurahOptions={}] History behavior.
	 */
	navigate(tiferesNextState, gevurahOptions = {}) {
		this.current = { ...this.current, ...tiferesNextState };
		if (typeof history !== "undefined" && typeof location !== "undefined") {
			const malchusUrl = docsUrlForState(location.href, this.current);
			const hodMethod = gevurahOptions.replace
				? "replaceState"
				: "pushState";
			history[hodMethod]({}, "", malchusUrl);
		}
		this.notify();
	}

	/** Installs one popstate listener, idempotently, when a browser event target exists. */
	initializeHistory() {
		if (
			this.historyInitialized
			|| typeof addEventListener === "undefined"
		) {
			return;
		}
		addEventListener("popstate", this.handlePopState);
		this.historyInitialized = true;
	}

	/** Rehydrates state from browser location after Back or Forward navigation. */
	handlePopState() {
		if (typeof location === "undefined") {
			return;
		}
		this.current = docsStateFromLocation(location);
		this.notify();
	}

	/** Notifies every current subscriber with an isolated state copy. */
	notify() {
		for (const chochmahListener of this.listeners) {
			chochmahListener(this.getState());
		}
	}

	/** @returns {object} Browser-derived state or an empty server/test-safe state. */
	initialState() {
		if (typeof location === "undefined") {
			return { ...createEmptyDocsState(), heading: "" };
		}
		return docsStateFromLocation(location);
	}
}

const yesodStore = new DocsYesodStateStore();

/** @returns {object} Defensive copy of current Docs state. */
export function getState() {
	return yesodStore.getState();
}

/** @param {Function} chochmahListener Subscriber callback. @returns {Function} Unsubscribe function. */
export function subscribe(chochmahListener) {
	return yesodStore.subscribe(chochmahListener);
}

/** @param {object} tiferesNextState Partial state. @param {object} [gevurahOptions={}] History options. */
export function navigate(tiferesNextState, gevurahOptions = {}) {
	yesodStore.navigate(tiferesNextState, gevurahOptions);
}

/** Initializes browser Back/Forward synchronization exactly once. */
export function initializeHistory() {
	yesodStore.initializeHistory();
}
