//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the palette vessel in this instant, revealing
 * its focused js render background service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H — Map palettes: three heichalos, three atmospheres, one engine.
 * These values intentionally echo the target mockup: parchment, blue night,
 * and ember Malchus, all usable without external assets.
 */
export const PALETTES = {
	parchment: {
		skyTop: '#ded6c2',
		skyBottom: '#837966',
		ink: '#2b2924',
		line: '#6b6254',
		glow: '#f4d36a',
		stain: 'rgba(65,48,28,.09)',
		platform: '#38342f'
	},
	blue: {
		skyTop: '#081321',
		skyBottom: '#1f425f',
		ink: '#c4e6ff',
		line: '#5c7fa2',
		glow: '#8bd4ff',
		stain: 'rgba(20,40,68,.18)',
		platform: '#202b35'
	},
	ember: {
		skyTop: '#1c0705',
		skyBottom: '#743019',
		ink: '#ffd2a0',
		line: '#a75631',
		glow: '#ff9f4a',
		stain: 'rgba(255,120,55,.11)',
		platform: '#33231d'
	}
};

/**
 * Reveals the palette for behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} map The map value entering this behavior.
 */
export function paletteFor(map) {
	return PALETTES[map.theme] || PALETTES.parchment;
}
