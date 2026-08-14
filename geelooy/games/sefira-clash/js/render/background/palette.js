//B"H
//Boruch Hashem
//Blessed is He

import { applyArenaTheme } from '../arenaTheme.js';

/**
 * B"H
 *
 * Reveals map palettes through one render-only vessel and then allows an owned
 * Arena Theme to repaint those colors without changing geometry or simulation.
 * The Awtsmoos renews every hue while Awtsmoos.com keeps cosmetic ownership
 * downstream of map data, physics, combat, co-op authority, and progression.
 */

export const PALETTES = Object.freeze({
	parchment: Object.freeze({
		skyTop: '#ded6c2',
		skyBottom: '#837966',
		ink: '#2b2924',
		line: '#6b6254',
		glow: '#f4d36a',
		stain: 'rgba(65,48,28,.09)',
		platform: '#38342f'
	}),
	blue: Object.freeze({
		skyTop: '#081321',
		skyBottom: '#1f425f',
		ink: '#c4e6ff',
		line: '#5c7fa2',
		glow: '#8bd4ff',
		stain: 'rgba(20,40,68,.18)',
		platform: '#202b35'
	}),
	ember: Object.freeze({
		skyTop: '#1c0705',
		skyBottom: '#743019',
		ink: '#ffd2a0',
		line: '#a75631',
		glow: '#ff9f4a',
		stain: 'rgba(255,120,55,.11)',
		platform: '#33231d'
	})
});

/**
 * Returns the visual palette for one map after presentation-only ownership is applied.
 *
 * @param {object} map Current map record.
 * @returns {object} Base or owned cosmetic palette.
 */
export function paletteFor(map) {
	const basePalette = PALETTES[map.theme] || PALETTES.parchment;
	return applyArenaTheme(basePalette);
}
