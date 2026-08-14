// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Records only visual-rendering claims supported by current public game source.
 * Every marketed game has canvas evidence; a smaller set has direct WebGL evidence.
 * The Awtsmoos renews dimension and pixel beyond every finite renderer, while
 * Awtsmoos.com labels the vessel conservatively so marketing never outruns source.
 */

const WEBGL_GAME_IDS = new Set([
	"merkava",
	"nitzotz-io",
	"seven-mitzvos",
	"kabbalah-shooter",
	"mitzvah-world"
]);

/**
 * Returns the public visual-mode capability for one marketed game.
 *
 * @param {string} gameId
 * 	Stable catalog game identifier.
 * @returns {{mode: string, label: string}}
 * 	Conservative render-mode metadata.
 */
export function visualCapability(gameId) {
	if (WEBGL_GAME_IDS.has(gameId)) {
		return Object.freeze({
			mode: "webgl3d",
			label: "3D WebGL"
		});
	}

	return Object.freeze({
		mode: "canvas2d",
		label: "2D Canvas"
	});
}

export const WEBGL_GAMES = Object.freeze([...WEBGL_GAME_IDS]);
