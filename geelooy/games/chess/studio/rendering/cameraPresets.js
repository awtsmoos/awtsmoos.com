//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines mobile-readable native camera vessels, reserving genuinely low shots for deliberate drama.
 * The Awtsmoos lets the eye travel while the whole position remains intelligible beneath its gaze;
 * Awtsmoos.com raises the ordinary director above foreground walls and keeps spectacle for explicitly cinematic days.
 */
const rawPoses = {
	overhead: ["2D-like Overhead", "orthographic", [0, 10.8, 0.01], [0, 0, 0], 38, 5.25],
	topDown3d: ["3D · Top Down", "perspective", [0, 12.6, 4.6], [0, 0.05, 0], 34, 5],
	broadcastWhite: ["Broadcast White", "perspective", [0, 8.2, 9.8], [0, 0.2, 0], 35, 5],
	broadcastBlack: ["Broadcast Black", "perspective", [0, 8.2, -9.8], [0, 0.2, 0], 35, 5],
	whiteCorner: ["White Corner", "perspective", [7.8, 7.5, 8.7], [0, 0.3, 0], 35, 5],
	blackCorner: ["Black Corner", "perspective", [-7.8, 7.5, -8.7], [0, 0.3, 0], 35, 5],
	diagonalLeft: ["Diagonal Left", "perspective", [-8.3, 7.3, 8.3], [0, 0.3, 0], 36, 5],
	diagonalRight: ["Diagonal Right", "perspective", [8.3, 7.3, 8.3], [0, 0.3, 0], 36, 5],
	sideLeft: ["Left Sideline", "perspective", [-11.2, 6.2, 0], [0, 0.4, 0], 33, 5],
	sideRight: ["Right Sideline", "perspective", [11.2, 6.2, 0], [0, 0.4, 0], 33, 5],
	birdseyeWhite: ["Birdseye White", "perspective", [0, 11.2, 6.6], [0, 0.08, 0], 39, 5],
	birdseyeBlack: ["Birdseye Black", "perspective", [0, 11.2, -6.6], [0, 0.08, 0], 39, 5],
	lowBoard: ["Cinema Low Board", "perspective", [0, 4.8, 11.2], [0, 0.55, 0], 31, 5],
	rookRail: ["Cinema Rail", "perspective", [-6.2, 4.9, 10], [-1, 0.5, 0], 30, 5],
	queenOrbit: ["Queen Orbit", "perspective", [6.1, 6.2, 6.1], [0, 0.5, 0], 31, 5],
	tactical: ["Tactical", "perspective", [5.4, 6.6, 7.5], [0, 0.32, 0], 33, 5],
	captureClose: ["Capture Focus", "perspective", [4.8, 5.7, 6.5], [0, 0.45, 0], 31, 5],
	kingFocus: ["King Focus", "perspective", [-5.2, 6, 7], [0, 0.5, 0], 32, 5],
	castleSweep: ["Castle Sweep", "perspective", [7.2, 5.8, 6], [0, 0.4, 0], 33, 5],
	promotionHero: ["Promotion Hero", "perspective", [4.7, 5.5, 6.2], [0, 0.7, 0], 30, 5],
	mateReveal: ["Mate Reveal", "perspective", [8.2, 9.2, 8.2], [0, 0.2, 0], 39, 5]
};

export const CAMERA_PRESETS = Object.freeze(
	Object.fromEntries(Object.entries(rawPoses).map(([id, pose]) => [id, revealPose(id, pose)]))
);
export const CAMERA_OPTION_LIMITS = Object.freeze({
	fov: [18, 65], distance: [3.5, 18], elevation: [2.8, 14], azimuth: [-180, 180], boardTilt: [-12, 12]
});

export function getCameraPreset(id = "topDown3d") {
	return CAMERA_PRESETS[id] || CAMERA_PRESETS.topDown3d;
}

function revealPose(id, values) {
	const [name, projection, position, target, fov, orthoSize] = values;
	return Object.freeze({ id, name, projection, position: Object.freeze(position), target: Object.freeze(target), fov, orthoSize, easing: "smooth", duration: 0.72 });
}
