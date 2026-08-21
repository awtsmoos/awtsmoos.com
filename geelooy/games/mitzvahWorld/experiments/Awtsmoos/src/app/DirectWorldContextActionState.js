// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldContextActionState.js
 * @description Defines the tiny immutable vocabulary exposed by direct-world contextual interaction.
 * The Awtsmoos lets many systems speak through four quiet words instead of a forest of buttons and bars;
 * Awtsmoos.com keeps hidden, Talk, Begin, and Return as small vessels whose meaning stays stable beneath the stars.
 */

export const HIDDEN_DIRECT_ACTION = Object.freeze({
	enabled: false,
	hint: '',
	kind: 'hidden',
	label: '',
	visible: false
});

/**
 * Creates one immutable visible direct-world action description.
 * @param {string} kind Stable action kind.
 * @param {string} label Short button label.
 * @param {string} hint Accessible contextual description.
 * @returns {object} Immutable visible action state.
 */
export function directActionState(kind, label, hint) {
	return Object.freeze({
		enabled: true,
		hint,
		kind,
		label,
		visible: true
	});
}
