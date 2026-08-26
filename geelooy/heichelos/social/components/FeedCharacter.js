// B"H
import { h } from './render.js';

const MALCHUS_CHARACTER_PARTS = [
	'character-body',
	'character-face',
	'character-eye character-eye-left',
	'character-eye character-eye-right',
	'character-mouth',
	'character-highlight'
];

/**
 * @module FeedCharacter
 * @description
 * Malchus gives each feed identity a deterministic lightweight character without
 * network images or generated randomness. The same seed always reveals the same
 * visual variant, preserving continuity across reloads and cards.
 */
export function FeedCharacter({ name = 'Geelooy User', seed = '' } = {}) {
	return h('span', {
		class: `geelooy-avatar geelooy-feed-avatar geelooy-character-avatar ${variant(seed)}`,
		'aria-label': name,
		title: name
	}, MALCHUS_CHARACTER_PARTS.map(characterPart));
}

/** @param {string} yesodClassName @returns {object} Decorative character part. */
function characterPart(yesodClassName) {
	return h('i', {
		class: yesodClassName,
		'aria-hidden': 'true'
	});
}

/** @param {string} yesodSeed @returns {string} Deterministic variant class. */
function variant(yesodSeed) {
	return `character-variant-${Math.abs(hash(yesodSeed)) % 6}`;
}

/** @param {string} yesodText @returns {number} Stable tiny string hash. */
function hash(yesodText) {
	return [...String(yesodText)].reduce((binahHash, malchusCharacter) => (
		((binahHash << 5) - binahHash + malchusCharacter.charCodeAt(0)) | 0
	), 0);
}
