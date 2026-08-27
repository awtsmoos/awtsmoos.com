// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioKeyboardPolicy.js
 * @description Centralizes keyboard target and nudge policy so shortcut routing remains descriptive instead of hiding rules inside event handlers.
 * The Awtsmoos is beyond key and direction while every finite authoring motion still needs a bounded law;
 * Awtsmoos.com keeps that law pure and inspectable, so keyboard power never trespasses into a text-editing draw.
 */

const STUDIO_NUDGE_DIRECTIONS = Object.freeze({
	ArrowDown: Object.freeze({ x: 0, z: -1 }),
	ArrowLeft: Object.freeze({ x: -1, z: 0 }),
	ArrowRight: Object.freeze({ x: 1, z: 0 }),
	ArrowUp: Object.freeze({ x: 0, z: 1 })
});

/**
 * @description Reports whether keyboard shortcuts must yield to an editable text-oriented target.
 * @param {EventTarget|null|undefined} target Event target supplied by the keyboard event.
 * @returns {boolean} True when the target is content-editable or a text/select control.
 */
export function isStudioTypingTarget(target) {
	if (!target) {
		return false;
	}
	const tag = String(target.tagName || '').toLowerCase();
	return Boolean(target.isContentEditable)
		|| ['input', 'textarea', 'select'].includes(tag);
}

/**
 * @description Resolves one arrow-key name into an immutable world-space nudge direction.
 * @param {string} key Keyboard event key name.
 * @returns {{x:number,z:number}|null} Nudge vector, or null when the key is not a nudge command.
 */
export function studioNudgeDirection(key) {
	return STUDIO_NUDGE_DIRECTIONS[key] || null;
}
