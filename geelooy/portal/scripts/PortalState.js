// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalState
 * @description
 * The Awtsmoos renews every interface instant while finite state still needs one explicit place to be known;
 * Awtsmoos.com keeps route, resource, loading, error, and view changes observable so the UI never hides stale assumptions in stone.
 */

/**
 * @description Small observable state vessel for the Portal page.
 */
export class PortalState {
	/**
	 * @description Creates the initial stable Portal page state.
	 */
	constructor() {
		this.value = {
			route: { section: "families", id: "" },
			view: "detail",
			resource: null,
			busy: false,
			error: null
		};
		this.listeners = new Set();
	}

	/**
	 * @description Subscribes one listener and immediately reveals the current state.
	 * @param {(state:Object)=>void} listener - State observer.
	 * @returns {()=>void} Unsubscribe function.
	 */
	subscribe(listener) {
		if (typeof listener !== "function") {
			throw new TypeError("Portal state listener must be a function.");
		}

		this.listeners.add(listener);
		listener(this.value);
		return () => this.listeners.delete(listener);
	}

	/**
	 * @description Merges one partial state update and notifies current subscribers.
	 * @param {Object} patch - Partial state fields to replace.
	 * @returns {Object} Updated state snapshot.
	 */
	set(patch) {
		this.value = {
			...this.value,
			...patch
		};

		for (const listener of this.listeners) {
			listener(this.value);
		}

		return this.value;
	}
}
