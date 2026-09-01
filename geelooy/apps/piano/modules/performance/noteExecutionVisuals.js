//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoNoteExecutionVisuals
 * @description
 * Malchus gives a sounding note visible garments when a matching key exists, while the Awtsmoos remains beyond visibility and form.
 * Awtsmoos.com keeps key discovery, mirrored activation, release, and realtime light in one vessel,
 * so MIDI and arpeggiated pitches may still sound beyond the viewport without forcing DOM responsibility into voice creation.
 */

import {
	activateNoteVisuals,
	deactivateNoteVisuals
} from '../keyboard/activeKeyVisuals.js';
import { resolveNoteVisuals } from '../keyboard/noteInputHelpers.js';
import { showRealtimeEffect } from '../visual/liveEffects.js';

/**
 * Resolves and activates visible keys corresponding to one sounding note.
 *
 * @param {string} noteName - Scientific pitch name.
 * @param {HTMLElement|null} keyElement - Optional directly hit key element.
 * @param {boolean} mirrorVisuals - Whether both keyboard rows should illuminate.
 * @param {Object} coords - Pointer or MIDI performance coordinates.
 * @returns {{keyElements:HTMLElement[],primaryElement:HTMLElement|null}} Visual record.
 */
export function beginExecutedNoteVisuals(
	noteName,
	keyElement,
	mirrorVisuals,
	coords
) {
	const keyElements = resolveNoteVisuals(
		noteName,
		keyElement || null,
		Boolean(mirrorVisuals)
	);
	const primaryElement = keyElements[0] || null;
	if (keyElements.length > 0) {
		activateNoteVisuals(keyElements);
	}
	if (primaryElement) {
		showRealtimeEffect(primaryElement, noteName, coords);
	}
	return {
		keyElements,
		primaryElement
	};
}

/**
 * Removes all visible activation associated with an executed note.
 *
 * @param {Object} activeNote - Active-note record containing key references.
 * @returns {void}
 */
export function endExecutedNoteVisuals(activeNote) {
	deactivateNoteVisuals(
		activeNote.keyElements
		|| [activeNote.keyElement].filter(Boolean)
	);
}
