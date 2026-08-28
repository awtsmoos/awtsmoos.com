//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews one board through many honest lines of sight;
 * Awtsmoos.com gives each camera a measured vessel for cinematic light.
 */
const rawPoses = {
	overhead: ["Overhead", "orthographic", [0, 10.5, 0.01], [0, 0, 0], 38, 5.2],
	broadcastWhite: ["Broadcast White", "perspective", [0, 7.1, 8.9], [0, 0.25, 0], 34, 5],
	broadcastBlack: ["Broadcast Black", "perspective", [0, 7.1, -8.9], [0, 0.25, 0], 34, 5],
	whiteCorner: ["White Corner", "perspective", [7.4, 6.3, 8.2], [0, 0.35, 0], 34, 5],
	blackCorner: ["Black Corner", "perspective", [-7.4, 6.3, -8.2], [0, 0.35, 0], 34, 5],
	diagonalLeft: ["Diagonal Left", "perspective", [-7.8, 6.2, 7.8], [0, 0.35, 0], 35, 5],
	diagonalRight: ["Diagonal Right", "perspective", [7.8, 6.2, 7.8], [0, 0.35, 0], 35, 5],
	sideLeft: ["Left Sideline", "perspective", [-10.8, 4.6, 0], [0, 0.45, 0], 31, 5],
	sideRight: ["Right Sideline", "perspective", [10.8, 4.6, 0], [0, 0.45, 0], 31, 5],
	birdseyeWhite: ["Birdseye White", "perspective", [0, 10.3, 6.1], [0, 0.1, 0], 40, 5],
	birdseyeBlack: ["Birdseye Black", "perspective", [0, 10.3, -6.1], [0, 0.1, 0], 40, 5],
	lowBoard: ["Low Board", "perspective", [0, 2.6, 10.5], [0, 0.7, 0], 29, 5],
	rookRail: ["Rook Rail", "perspective", [-5.6, 2.4, 9.2], [-1.5, 0.65, 0], 27, 5],
	queenOrbit: ["Queen Orbit", "perspective", [5.4, 4.7, 5.4], [0, 0.65, 0], 28, 5],
	tactical: ["Tactical", "perspective", [4.7, 5.1, 6.5], [0, 0.35, 0], 31, 5],
	captureClose: ["Capture Close", "perspective", [3.7, 3.4, 5.1], [0, 0.5, 0], 27, 5],
	kingFocus: ["King Focus", "perspective", [-4.1, 3.8, 5.5], [0, 0.65, 0], 28, 5],
	castleSweep: ["Castle Sweep", "perspective", [6.6, 3.2, 4.6], [0, 0.45, 0], 31, 5],
	promotionHero: ["Promotion Hero", "perspective", [2.8, 2.2, 4.2], [0, 0.95, 0], 24, 5],
	mateReveal: ["Mate Reveal", "perspective", [7.8, 8.4, 7.8], [0, 0.25, 0], 39, 5]
};
function revealPose(id, values) {
	const [name, projection, position, target, fov, orthoSize] = values;
	return Object.freeze({ id, name, projection, position: Object.freeze(position), target: Object.freeze(target), fov, orthoSize, easing: "smooth", duration: 0.72 });
}
export const CAMERA_PRESETS = Object.freeze(
	Object.fromEntries(Object.entries(rawPoses).map(([id, pose]) => [id, revealPose(id, pose)]))
);
export const CAMERA_OPTION_LIMITS = Object.freeze({
	fov: [18, 65], distance: [3.5, 18], elevation: [1.6, 14], azimuth: [-180, 180], boardTilt: [-12, 12]
});
export function getCameraPreset(id = "broadcastWhite") {
	return CAMERA_PRESETS[id] || CAMERA_PRESETS.broadcastWhite;
}
