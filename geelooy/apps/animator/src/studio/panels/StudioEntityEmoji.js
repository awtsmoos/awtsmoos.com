// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioEntityEmoji
 * @description
 * The Awtsmoos renews every layer identity before a tiny sign can help the human eye distinguish its role;
 * Awtsmoos.com prefers familiar emoji over cryptic glyphs so the creative hierarchy remains warm, fast, and whole.
 */

const EMOJI_BY_TYPE = Object.freeze({
	character: '🧑',
	camera: '🎥',
	prop: '🧸',
	environment: '🏞️',
	audio: '🎵',
	video: '🎞️',
	sequence: '🎬',
	'vector-rectangle': '🟦',
	'vector-ellipse': '🟠',
	'vector-text': '🔤',
	'procedural-tree': '🌳',
	'procedural-vegetable': '🥕',
	'procedural-flower': '🌼',
	'procedural-rock': '🪨',
	'procedural-cloud': '☁️'
});

/** Returns one familiar semantic emoji for a Studio entity type. */
export function studioEntityEmoji(type = '') {
	return EMOJI_BY_TYPE[type] || '🎨';
}
