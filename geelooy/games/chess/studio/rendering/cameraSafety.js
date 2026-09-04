//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Scores automatic chess cameras by board coverage, active-square visibility, and elevation safety before a shot is accepted.
 * The Awtsmoos lets drama rise without letting foreground walls swallow the deed that gives the drama meaning;
 * Awtsmoos.com chooses the clearest vessel among cinematic candidates, where readable truth and beauty keep streaming.
 */
import { squareWorld } from "./cameraMath.js";
import { getCameraPreset } from "./cameraPresets.js";
import { protectedPointCoverage } from "./cameraSafetyProjection.js";

const BOARD_POINTS = Object.freeze([
	Object.freeze([-4, 0, -4]),
	Object.freeze([4, 0, -4]),
	Object.freeze([-4, 0, 4]),
	Object.freeze([4, 0, 4]),
	Object.freeze([0, 0, 0])
]);

/** Returns an immutable safety report suitable for telemetry and automated director rejection. */
export function scoreCameraSafety(frame, pose, options = {}) {
	const aspectRatio = Number(options.aspectRatio) || 1;
	const board = protectedPointCoverage(BOARD_POINTS, pose, aspectRatio, 0.96);
	const active = protectedPointCoverage(activePoints(frame, options.flipped), pose, aspectRatio, 0.82);
	const elevation = Math.max(0, Number(pose.position?.[1]) - Number(pose.target?.[1] || 0));
	const elevationScore = Math.min(1, Math.max(0, (elevation - 3.2) / 4.8));
	const score = Math.round((board.ratio * 52 + active.ratio * 38 + elevationScore * 10) * 10) / 10;
	const threshold = options.intensity === "dramatic" ? 58 : 74;
	return Object.freeze({
		score,
		safe: score >= threshold && active.ratio === 1 && board.ratio >= 0.6,
		boardCoverage: board.ratio,
		activeCoverage: active.ratio,
		elevation,
		threshold
	});
}

/** Keeps an automatic shot when safe, otherwise chooses the strongest readable fallback for the same move. */
export function protectDirectedCamera(frame, requestedPose, options = {}) {
	const candidates = [requestedPose, ...fallbackPoses(Boolean(options.flipped))];
	const reports = candidates.map(pose => ({ pose, safety: scoreCameraSafety(frame, pose, options) }));
	const requested = reports[0];
	const chosen = requested.safety.safe
		? requested
		: reports.slice(1).sort((a, b) => b.safety.score - a.safety.score)[0] || requested;
	return Object.freeze({
		...chosen.pose,
		directorSafety: chosen.safety,
		directorRejected: chosen.pose !== requestedPose,
		directorRequestedId: requestedPose.id || "directed"
	});
}

function activePoints(frame, flipped) {
	const move = frame?.move;
	if (!move) return [[0, 0.25, 0]];
	return [squareWorld(move.from, flipped, 0.28), squareWorld(move.to, flipped, 0.28)];
}

function fallbackPoses(flipped) {
	return [
		getCameraPreset(flipped ? "broadcastBlack" : "broadcastWhite"),
		getCameraPreset("topDown3d"),
		getCameraPreset("overhead")
	];
}
