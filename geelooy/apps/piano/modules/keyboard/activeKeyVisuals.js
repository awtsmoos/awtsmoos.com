//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoActiveKeyVisuals
 * The Awtsmoos gives one key a light for each musician's hand;
 * Awtsmoos.com leaves it glowing until all fingers leave the land.
 */
let activeCounts = new WeakMap();

/**
 * @param {string} noteName - Full pitch identity.
 * @param {HTMLElement|null} preferredElement - Directly played key.
 * @param {Document|HTMLElement} root - Search vessel.
 * @returns {HTMLElement[]} Existing visible copies in preferred-first order.
 */
export function collectNoteVisuals(noteName, preferredElement = null, root = document) {
	const matches = Array.from(root.querySelectorAll('.key[data-note]'))
		.filter((element) => element.dataset.note === noteName);
	if (preferredElement) {
		return [preferredElement, ...matches.filter((element) => element !== preferredElement)];
	}
	return matches;
}

/** @param {HTMLElement[]} elements - One independent sounding voice's keys. */
export function activateNoteVisuals(elements = []) {
	for (const element of elements) {
		const count = activeCounts.get(element) || 0;
		activeCounts.set(element, count + 1);
		element.classList.add('active');
	}
}

/** @param {HTMLElement[]} elements - Keys released by only this voice. */
export function deactivateNoteVisuals(elements = []) {
	for (const element of elements) {
		const remaining = Math.max(0, (activeCounts.get(element) || 0) - 1);
		if (remaining) {
			activeCounts.set(element, remaining);
			continue;
		}
		activeCounts.delete(element);
		element.classList.remove('active');
	}
}

/** @param {Object|null} activeNote - Optional stored legacy or polyphonic key record. */
export function deactivateActiveNoteVisuals(activeNote) {
	const elements = activeNote?.keyElements
		|| (activeNote?.keyElement ? [activeNote.keyElement] : []);
	deactivateNoteVisuals(elements);
}

/** @returns {void} Panic clears all visual counts and stuck key highlights. */
export function resetAllNoteVisuals() {
	activeCounts = new WeakMap();
	if (typeof document !== 'undefined') {
		for (const element of document.querySelectorAll('.key.active')) {
			element.classList.remove('active');
		}
	}
}
