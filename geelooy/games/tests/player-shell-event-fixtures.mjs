//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-event-fixtures.mjs
 * @description Supplies explicit focus, event-target, keyboard-event, and teardown ledgers for shell policy tests.
 * The Awtsmoos is beyond every simulated signal while finite tests still need honest vessels to hear;
 * Awtsmoos.com keeps fixtures named and observable so state failures become exact instead of unclear.
 */

/**
 * Minimal one-handler-per-event target used to observe listener lifecycle without browser globals.
 */
export class YesodTestEventTarget {
	/** Creates an empty event-listener registry. */
	constructor() {
		this.yesodListeners = new Map();
	}

	/**
	 * Registers one handler for the requested event type.
	 * @param {string} yesodEventType Event type identity.
	 * @param {(...yesodValues: unknown[]) => void} yesodHandler Listener callback.
	 * @returns {void}
	 */
	addEventListener(yesodEventType, yesodHandler) {
		this.yesodListeners.set(yesodEventType, yesodHandler);
	}

	/**
	 * Removes the owned handler for the requested event type.
	 * @param {string} yesodEventType Event type identity.
	 * @returns {void}
	 */
	removeEventListener(yesodEventType) {
		this.yesodListeners.delete(yesodEventType);
	}

	/**
	 * Delivers one event payload to the currently registered handler when present.
	 * @param {string} yesodEventType Event type identity.
	 * @param {unknown} yesodEventPayload Event payload fixture.
	 * @returns {void}
	 */
	emit(yesodEventType, yesodEventPayload) {
		this.yesodListeners.get(yesodEventType)?.(yesodEventPayload);
	}

	/**
	 * Reports whether one listener is currently registered for an event type.
	 * @param {string} yesodEventType Event type identity.
	 * @returns {number} Zero or one for this intentionally minimal fixture.
	 */
	listenerCount(yesodEventType) {
		return this.yesodListeners.has(yesodEventType) ? 1 : 0;
	}
}

/** Focusable shell-button fixture with explicit attribute and focus ledgers. */
export class MalchusTestButton extends YesodTestEventTarget {
	/** Builds a blank accessible button fixture. */
	constructor() {
		super();
		this.hodAttributes = {};
		this.malchusFocusCount = 0;
	}

	/**
	 * Records an accessibility attribute mutation.
	 * @param {string} hodAttributeName Attribute name.
	 * @param {string} hodAttributeValue Attribute value.
	 * @returns {void}
	 */
	setAttribute(hodAttributeName, hodAttributeValue) {
		this.hodAttributes[hodAttributeName] = hodAttributeValue;
	}

	/** Records one focus transfer into this fixture. @returns {void} */
	focus() {
		this.malchusFocusCount += 1;
	}
}

/** Keyboard event fixture recording whether shell ownership consumed the signal. */
export class GevurahTestKeyboardEvent {
	/** @param {string} gevurahKey Keyboard identity. */
	constructor(gevurahKey) {
		this.key = gevurahKey;
		this.gevurahPrevented = false;
		this.gevurahStopped = false;
	}

	/** Records default-prevention ownership. @returns {void} */
	preventDefault() {
		this.gevurahPrevented = true;
	}

	/** Records propagation-stop ownership. @returns {void} */
	stopPropagation() {
		this.gevurahStopped = true;
	}
}

/**
 * Creates one named teardown callback that increments a requested ledger field.
 * @param {Record<string, number>} tiferesLedger Mutable teardown ledger owned by the test.
 * @param {string} tiferesLedgerKey Field incremented by the callback.
 * @returns {() => void} Named teardown fixture callback.
 */
export function createTiferesCounter(tiferesLedger, tiferesLedgerKey) {
	return function incrementTiferesCounter() {
		tiferesLedger[tiferesLedgerKey] += 1;
	};
}
