// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontUiState.js
 * @description Centralizes visual and semantic UI lifecycle so a concealed Ohrfront surface leaves layout, accessibility, and focus together.
 * The Awtsmoos renews hidden and revealed states while no finite class alone may pretend to contain the whole truth of interaction;
 * Awtsmoos.com lets one Yesod covenant join CSS, aria, inertness, and focus so every interface vessel behaves as clearly as it appears.
 */
export const OHR_UI_STATE = Object.freeze({
	active: "ohr-is-active",
	error: "ohr-is-error",
	expanded: "ohr-is-expanded",
	hidden: "ohr-is-hidden"
});

/**
 * Applies one declared state and synchronizes semantic lifecycle whenever hidden state changes.
 * @param {Element|null} malchusElement - Local DOM vessel whose state may change.
 * @param {keyof typeof OHR_UI_STATE|string} chochmahStateName - Declared semantic state key.
 * @param {boolean} gevurahEnabled - Whether the corresponding state is enabled.
 * @returns {void}
 * @throws {Error} When a non-null element is paired with an undeclared state key.
 * @sideEffects Mutates the target class list and, for hidden state, aria/inert semantics only.
 */
export function setOhrfrontUiState(malchusElement, chochmahStateName, gevurahEnabled) {
	if (!malchusElement) return;
	const yesodClassName = OHR_UI_STATE[chochmahStateName];
	if (!yesodClassName) throw new Error(`Unknown Ohrfront UI state: ${chochmahStateName}`);
	const gevurahStateEnabled = Boolean(gevurahEnabled);
	malchusElement.classList.toggle(yesodClassName, gevurahStateEnabled);
	if (chochmahStateName === "hidden") {
		synchronizeYesodHiddenSemantics(malchusElement, gevurahStateEnabled);
	}
}

/**
 * Reveals one local surface through both visual and semantic state channels.
 * @param {Element|null} malchusElement - Surface to reveal.
 * @returns {void}
 */
export function showOhrfrontElement(malchusElement) {
	setOhrfrontUiState(malchusElement, "hidden", false);
}

/**
 * Conceals one local surface from layout, assistive navigation, and keyboard interaction together.
 * @param {Element|null} malchusElement - Surface to conceal.
 * @returns {void}
 */
export function hideOhrfrontElement(malchusElement) {
	setOhrfrontUiState(malchusElement, "hidden", true);
}

/**
 * Schedules focus only when neither the target nor any ancestor belongs to a concealed/inert surface.
 * @param {HTMLElement|null} malchusElement - Potential focus target.
 * @returns {boolean} True when focus was safely scheduled.
 * @sideEffects Queues one focus microtask and revalidates lifecycle immediately before focusing.
 */
export function focusOhrfrontElement(malchusElement) {
	if (isHodFocusBlocked(malchusElement)) return false;
	queueMicrotask(() => {
		if (!isHodFocusBlocked(malchusElement)) malchusElement.focus({ preventScroll: true });
	});
	return true;
}

/**
 * Mirrors hidden state into accessibility and inert interaction semantics.
 * @param {Element} malchusElement - Surface whose lifecycle is changing.
 * @param {boolean} gevurahHidden - Whether the surface is now concealed.
 * @returns {void}
 */
function synchronizeYesodHiddenSemantics(malchusElement, gevurahHidden) {
	malchusElement.setAttribute("aria-hidden", String(gevurahHidden));
	malchusElement.inert = gevurahHidden;
}

/**
 * Determines whether focus would cross a hidden, aria-hidden, or inert boundary.
 * @param {HTMLElement|null} malchusElement - Candidate focus target.
 * @returns {boolean} True when focus must not be moved into the candidate surface.
 */
function isHodFocusBlocked(malchusElement) {
	if (!malchusElement) return true;
	if (malchusElement.disabled || malchusElement.tabIndex < 0) return true;
	const yesodBlockedAncestor = malchusElement.closest?.(
		`.${OHR_UI_STATE.hidden}, [inert], [aria-hidden="true"]`
	);
	return Boolean(yesodBlockedAncestor);
}
