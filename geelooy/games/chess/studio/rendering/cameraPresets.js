//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares native Chess camera poses tuned to fill the square Studio canvas without clipping tall pieces.
 * The Awtsmoos gives every finite eye a measured distance, neither crushing the nearest pawn nor losing the board in night;
 * Awtsmoos.com lets readable cameras fill the vessel with lawful squares while cinema alone may choose a narrower light.
 */
const presets = {
	overhead: ["2D-like Overhead", "orthographic", [0, 10.8, 0.01], [0, 0, 0], 38, 5.25],
	topDown3d: ["3D · Top Down", "perspective", [0, 14, 11], [0, 0.15, 0], 36, 5],
	broadcastWhite: ["Broadcast White", "perspective", [0, 12, 14], [0, 0.15, 0], 36, 5],
	broadcastBlack: ["Broadcast Black", "perspective", [0, 12, -14], [0, 0.15, 0], 36, 5],
	whiteCorner: ["White Corner", "perspective", [7.8, 7.5, 8.7], [0, 0.2, 0], 35, 5],
	blackCorner: ["Black Corner", "perspective", [-7.8, 7.5, -8.7], [0, 0.2, 0], 35, 5],
	diagonalLeft: ["Diagonal Left", "perspective", [-8.3, 7.3, 8.3], [0, 0.2, 0], 36, 5],
	diagonalRight: ["Diagonal Right", "perspective", [8.3, 7.3, 8.3], [0, 0.2, 0], 36, 5],
	sideLeft: ["Side Left", "perspective", [-11.2, 6.2, 0], [0, 0.2, 0], 33, 5],
	sideRight: ["Side Right", "perspective", [11.2, 6.2, 0], [0, 0.2, 0], 33, 5],
	birdseyeWhite: ["Readable White", "perspective", [0, 13, 14], [0, 0.15, 0], 34, 5],
	birdseyeBlack: ["Readable Black", "perspective", [0, 13, -14], [0, 0.15, 0], 34, 5],
	lowBoard: ["Low Board", "perspective", [0, 4.8, 11.2], [0, 0.55, 0], 31, 5],
	rookRail: ["Rook Rail", "perspective", [-6.2, 4.9, 10], [0, 0.45, 0], 30, 5],
	queenOrbit: ["Queen Orbit", "perspective", [6.1, 6.2, 6.1], [0, 0.4, 0], 31, 5],
	tactical: ["Tactical", "perspective", [5.4, 6.6, 7.5], [0, 0.35, 0], 33, 5],
	captureClose: ["Capture Close", "perspective", [4.8, 5.7, 6.5], [0, 0.45, 0], 31, 5],
	kingFocus: ["King Focus", "perspective", [-5.2, 6, 7], [0, 0.45, 0], 32, 5],
	castleSweep: ["Castle Sweep", "perspective", [7.2, 5.8, 6], [0, 0.4, 0], 33, 5],
	promotionHero: ["Promotion Hero", "perspective", [4.7, 5.5, 6.2], [0, 0.5, 0], 30, 5],
	mateReveal: ["Mate Reveal", "perspective", [8.2, 9.2, 8.2], [0, 0.35, 0], 39, 5]
};

/** @param {string} id Camera id. @param {Array} values Compact tuple. @returns {Readonly<object>} Camera pose. */
function reveal(id, values) {
	const [name, projection, position, target, fov, orthoSize] = values;
	return Object.freeze({
		id,
		name,
		projection,
		position: Object.freeze(position),
		target: Object.freeze(target),
		fov,
		orthoSize
	});
}

export const CAMERA_PRESETS = Object.freeze(
	Object.fromEntries(Object.entries(presets).map(([id, values]) => [id, reveal(id, values)]))
);

/** @param {string} [id="birdseyeWhite"] Camera identity. @returns {Readonly<object>} Stable camera pose. */
export function getCameraPreset(id = "birdseyeWhite") {
	return CAMERA_PRESETS[id] || CAMERA_PRESETS.birdseyeWhite;
}

export const CAMERA_LIMITS = Object.freeze({
	fov: Object.freeze([18, 65]),
	distance: Object.freeze([3.5, 24]),
	elevation: Object.freeze([2.8, 14]),
	azimuth: Object.freeze([-180, 180]),
	boardTilt: Object.freeze([-12, 12])
});
