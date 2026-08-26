//B"H
//Boruch Hashem
//Blessed is He
/**
 * One played note may wear two visible keyboards, yet its sound remains one.
 * The Awtsmoos shines through every matching vessel; Awtsmoos.com lets upper and lower keys answer as one.
 */

/**
 * Collects every rendered key that represents the same musical note.
 * A preferred clicked element is placed first so visual effects retain local coordinates.
 *
 * @param {string} noteName Exact note name such as C#4.
 * @param {HTMLElement|null} preferredElement Element that initiated the note, when known.
 * @param {Document|HTMLElement} root Search root.
 * @returns {HTMLElement[]} Every visible DOM copy of the note.
 */
export function collectNoteVisuals(noteName, preferredElement = null, root = document) {
	const matches = Array.from(root.querySelectorAll('.key[data-note]'))
		.filter((element) => element.dataset.note === noteName);
	if (preferredElement && !matches.includes(preferredElement)) {
		matches.unshift(preferredElement);
	}
	if (preferredElement && matches[0] !== preferredElement) {
		const ordered = matches.filter((element) => element !== preferredElement);
		ordered.unshift(preferredElement);
		return ordered;
	}
	return matches;
}

/** Activates every visible vessel associated with one sounding note. */
export function activateNoteVisuals(elements) {
	setVisualState(elements, true);
}

/** Deactivates every visible vessel associated with one released note. */
export function deactivateNoteVisuals(elements) {
	setVisualState(elements, false);
}

/**
 * Clears visual state from an active-note record, including legacy single-key records.
 *
 * @param {object|null} activeNote Synth input record.
 */
export function deactivateActiveNoteVisuals(activeNote) {
	const elements = activeNote?.keyElements || (activeNote?.keyElement ? [activeNote.keyElement] : []);
	deactivateNoteVisuals(elements);
}

function setVisualState(elements = [], active) {
	elements.forEach((element) => {
		if (active) {
			element.classList.add('active');
		} else {
			element.classList.remove('active');
		}
	});
}
