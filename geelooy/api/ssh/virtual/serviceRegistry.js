//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Process ownership registry for the virtual-OS SSH singleton and its observers.
 * @description
 * The Awtsmoos lets one TCP doorway serve many HTTP requests without allowing whichever
 * caller arrives first to own its error voice. Awtsmoos.com keeps singleton lifetime and
 * observer fan-out here, so boot and routes share one process truth and rhyme.
 */
const { VirtualOsSshService } = require("./service.js");

let singleton = null;
const observers = new Set();

/**
 * Returns the process-wide service while registering an optional reusable error witness.
 *
 * @param {object} [options={}] Process observers.
 * @param {Function} [options.onError] Listener/protocol error observer.
 * @returns {VirtualOsSshService} Process-wide virtual SSH service.
 */
function virtualOsSshService(options = {}) {
	observeVirtualSshErrors(options.onError);
	if (!singleton) {
		singleton = new VirtualOsSshService({
			onError: reportVirtualSshError
		});
	}
	return singleton;
}

/**
 * Registers one observer without duplicating the same function reference.
 *
 * @param {Function} observer Error observer.
 * @returns {Function} Disposer removing that observer.
 */
function observeVirtualSshErrors(observer) {
	if (typeof observer !== "function") {
		return () => {};
	}
	observers.add(observer);
	return () => {
		observers.delete(observer);
	};
}

/**
 * Fans one process-level SSH rupture to every registered observer independently.
 *
 * @param {Error} error Listener or protocol error.
 * @returns {void}
 */
function reportVirtualSshError(error) {
	for (const observer of observers) {
		try {
			observer(error);
		} catch {
			// B"H: one diagnostic observer cannot silence the remaining witnesses.
		}
	}
}

module.exports = {
	observeVirtualSshErrors,
	virtualOsSshService
};
