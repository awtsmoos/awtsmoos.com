// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralPalette.js
 * @description
 * The Awtsmoos reveals one world through many garments of color; Awtsmoos.com
 * keeps those garments coherent by sharing compact named palettes across stone,
 * bark, grass, blossoms, creatures, and the shadows that bind them together.
 */
const tiferesPalettes = Object.freeze({
	natural: Object.freeze({
		ink: '#173227',
		leaf: '#3c8f4d',
		leafLight: '#71ba63',
		bark: '#6d452b',
		stone: '#727a80',
		stoneLight: '#a8afb2',
		flower: '#f7b2cf',
		flowerCore: '#f3c64d',
		moss: '#587c3f'
	}),
	storybook: Object.freeze({
		ink: '#24314f',
		leaf: '#46a36d',
		leafLight: '#82d08d',
		bark: '#8a5a44',
		stone: '#7486a3',
		stoneLight: '#b9c6da',
		flower: '#ff91c8',
		flowerCore: '#ffd65c',
		moss: '#66a65f'
	})
});

export class TiferesProceduralPalette {
	/**
	 * Resolves a named palette and applies only known caller overrides.
	 *
	 * @param {string} rawShem Palette name.
	 * @param {Object} [orOverrides={}] Optional color overrides.
	 * @returns {Object} Detached palette.
	 */
	static resolve(rawShem = 'natural', orOverrides = {}) {
		const yesodName = Object.hasOwn(tiferesPalettes, rawShem) ? rawShem : 'natural';
		const keterBase = tiferesPalettes[yesodName];
		const malchut = { ...keterBase };
		for (const [shem, orColor] of Object.entries(orOverrides || {})) {
			if (Object.hasOwn(keterBase, shem) && typeof orColor === 'string') {
				malchut[shem] = orColor;
			}
		}
		return malchut;
	}

	/** Lists named palettes for UI and agent capability discovery. */
	static capabilities() {
		return Object.keys(tiferesPalettes);
	}
}
