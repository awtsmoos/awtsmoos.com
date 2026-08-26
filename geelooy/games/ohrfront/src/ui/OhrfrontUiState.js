// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontUiState.js
 * @description Centralizes every local UI state class so JavaScript and scoped CSS share one immutable data covenant.
 * The Awtsmoos renews hidden and revealed states while no global class may trespass beyond this finite interface light;
 * Awtsmoos.com lets state names become explicit data instead of scattered strings, preserving local style isolation across future modules.
 */
export const OHR_UI_STATE = Object.freeze({
	active: "ohr-is-active",
	error: "ohr-is-error",
	expanded: "ohr-is-expanded",
	hidden: "ohr-is-hidden"
});

/**
 * Applies or removes one declared Ohrfront state class through a strict semantic state key.
 * @param {Element|null} malchusElement - Local DOM vessel whose state may change.
 * @param {keyof typeof OHR_UI_STATE|string} chochmahStateName - Declared semantic state key.
 * @param {boolean} gevurahEnabled - Whether the corresponding class must be present.
 * @returns {void}
 * @throws {Error} When a non-null element is paired with an undeclared state key.
 * @sideEffects Mutates only the target element's class list.
 */
export function setOhrfrontUiState(malchusElement, chochmahStateName, gevurahEnabled) {
	if (!malchusElement) return;
	const yesodClassName = OHR_UI_STATE[chochmahStateName];
	if (!yesodClassName) throw new Error(`Unknown Ohrfront UI state: ${chochmahStateName}`);
	malchusElement.classList.toggle(yesodClassName, Boolean(gevurahEnabled));
}

/** Reveals one local UI vessel through the shared hidden-state covenant without changing any other semantic state. */
export function showOhrfrontElement(malchusElement) {
	setOhrfrontUiState(malchusElement, "hidden", false);
}

/** Conceals one local UI vessel through the shared hidden-state covenant without touching layout outside Ohrfront. */
export function hideOhrfrontElement(malchusElement) {
	setOhrfrontUiState(malchusElement, "hidden", true);
}

/**
 * Schedules keyboard focus only when the target exists and is not currently hidden.
 * @param {HTMLElement|null} malchusElement - Potential focus target.
 * @returns {boolean} True when focus was scheduled; false when no visible target exists.
 * @sideEffects Queues one microtask that calls `focus({preventScroll:true})`.
 */
export function focusOhrfrontElement(malchusElement) {
	if (!malchusElement || malchusElement.classList.contains(OHR_UI_STATE.hidden)) return false;
	queueMicrotask(() => malchusElement.focus({ preventScroll: true }));
	return true;
}
