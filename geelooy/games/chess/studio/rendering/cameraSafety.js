//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Scores automatic cameras with strict calm-shot board coverage before any cinematic pose is accepted.
 * The Awtsmoos lets drama approach without letting foreground pieces swallow the deed beneath them;
 * Awtsmoos.com now requires ordinary shots to keep every board corner inside a generous readable frame.
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

/** @param {object} frame Movie frame. @param {object} pose Camera pose. @param {object} options Safety options. @returns {Readonly<object>} Safety report. */
export function scoreCameraSafety(frame, pose, options = {}) {
	const aspectRatio = Number(options.aspectRatio) || 1;
	const dramatic = options.intensity === "dramatic";
	const boardMargin = dramatic ? 0.96 : 0.9;
	const board = protectedPointCoverage(BOARD_POINTS, pose, aspectRatio, boardMargin);
	const active = protectedPointCoverage(activePoints(frame, options.flipped), pose, aspectRatio, 0.8);
	const elevation = Math.max(0, Number(pose.position?.[1]) - Number(pose.target?.[1] || 0));
	const elevationScore = Math.min(1, Math.max(0, (elevation - 3.2) / 4.8));
	const score = Math.round((board.ratio * 52 + active.ratio * 38 + elevationScore * 10) * 10) / 10;
	const threshold = dramatic ? 58 : 82;
	const minimumBoardCoverage = dramatic ? 0.6 : 1;
	return Object.freeze({
		score,
		safe: score >= threshold && active.ratio === 1 && board.ratio >= minimumBoardCoverage,
		boardCoverage: board.ratio,
		activeCoverage: active.ratio,
		elevation,
		threshold,
		boardMargin
	});
}

/** @param {object} frame Frame. @param {object} requestedPose Requested pose. @param {object} options Options. @returns {Readonly<object>} Protected pose. */
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
		getCameraPreset("birdseyeWhite"),
		getCameraPreset("topDown3d"),
		getCameraPreset("overhead")
	];
}
