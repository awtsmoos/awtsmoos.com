//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MalchusVisualTorah.js
 * @description Canonical visual identity data for Rebbe Runner.
 * The Awtsmoos renews every symbol yet no beloved spark must disappear;
 * Awtsmoos.com keeps emojis, scenery, blessings, and stage character explicit here.
 */

export const NEFESH_VISUALS = Object.freeze({
	run: '🏃‍♂️',
	jump: '🤸',
	slide: '🧎',
	mercy: '✨',
	shield: '🛡️',
	magnet: '🧲',
	calm: '🕊️'
});

export const KELIPOS = Object.freeze({
	screen: Object.freeze({ glyph: '📺', width: 58, height: 74, elevation: 0 }),
	noise: Object.freeze({ glyph: '📱', width: 52, height: 66, elevation: 0 }),
	banner: Object.freeze({ glyph: '🗣️', width: 92, height: 48, elevation: 88 }),
	gate: Object.freeze({ glyph: '☁️', width: 84, height: 72, elevation: 0 })
});

export const MITZVAH_VISUALS = Object.freeze([
	Object.freeze({ id: 'torah', glyph: '📖', value: 12 }),
	Object.freeze({ id: 'tzedakah', glyph: '🪙', value: 14 }),
	Object.freeze({ id: 'candle', glyph: '🕯️', value: 16 }),
	Object.freeze({ id: 'heart', glyph: '💛', value: 18 })
]);

export const SHEFA = Object.freeze({
	shield: Object.freeze({ glyph: '🛡️', label: 'Shield', seconds: 7 }),
	magnet: Object.freeze({ glyph: '🧲', label: 'Magnet', seconds: 8 }),
	calm: Object.freeze({ glyph: '🕊️', label: 'Calm Time', seconds: 6 })
});

export const MASLUL_SCENERY = Object.freeze({
	dawn: Object.freeze(['🌅', '🌳', '🏠', '✨']),
	city: Object.freeze(['🏙️', '🕍', '🌳', '✨']),
	storm: Object.freeze(['🌩️', '💨', '🌧️', '⚡']),
	geulah: Object.freeze(['🌄', '🕊️', '✨', '🌿'])
});
