//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Directs semantic shots and explicit orbit, zoom, broadcast, or static camera motion.
 * The Awtsmoos lets one move be seen through many lawful eyes;
 * Awtsmoos.com keeps every path deterministic so preview and movie share the skies.
 */
import { getCameraPreset } from "./cameraPresets.js";
import { moveTarget, orbitPose, squareWorld, withTarget } from "./cameraMath.js";

const BALANCED_ANGLES = ["diagonalLeft", "tactical", "diagonalRight", "rookRail", "queenOrbit", "sideLeft", "whiteCorner", "sideRight"];
const DRAMATIC_ANGLES = ["lowBoard", "rookRail", "queenOrbit", "whiteCorner", "blackCorner", "tactical"];

export function directCamera(frame, options = {}) {
	const flipped = Boolean(options.flipped);
	const intensity = options.intensity || "balanced";
	const presetId = choosePreset(frame, intensity);
	let pose = getCameraPreset(presetId);
	pose = withTarget(pose, targetForFrame(frame, flipped, pose));
	return varyPose(pose, frame?.ply || 0, presetId, intensity);
}

export function directCameraMotion(frame, options = {}) {
	const motion = options.cameraMotion || "director";
	if (motion === "orbit") return orbitCamera(frame, options);
	if (motion === "zoom") return zoomCamera(frame, options);
	if (motion === "broadcast") return broadcastCamera(frame, options);
	if (motion === "static") return staticCamera(options);
	return directCamera(frame, options);
}

export function choosePreset(frame, intensity = "balanced") {
	const move = frame?.move;
	if (!move) return "birdseyeWhite";
	if (frame.mate) return "mateReveal";
	if (move.promotion) return "promotionHero";
	if (move.castle) return "castleSweep";
	if (frame.check) return "kingFocus";
	if (move.capture) return "captureClose";
	if (intensity === "calm") return frame.ply % 2 ? "broadcastWhite" : "broadcastBlack";
	const angles = intensity === "dramatic" ? DRAMATIC_ANGLES : BALANCED_ANGLES;
	return angles[frame.ply % angles.length];
}

function orbitCamera(frame, options) {
	const base = withTarget(getCameraPreset("queenOrbit"), targetForFrame(frame, options.flipped, [0, 0.5, 0]));
	const degrees = ((frame?.ply || 0) * 24 + (options.flipped ? 180 : 0)) % 360;
	return orbitPose(base, degrees, 1.08);
}

function zoomCamera(frame, options) {
	const base = withTarget(getCameraPreset(frame?.move?.capture ? "captureClose" : "tactical"), targetForFrame(frame, options.flipped, [0, 0.5, 0]));
	return orbitPose(base, (frame?.ply || 0) % 2 ? 5 : -5, 0.72);
}

function broadcastCamera(frame, options) {
	const preset = options.flipped ? "broadcastBlack" : "broadcastWhite";
	return withTarget(getCameraPreset(preset), targetForFrame(frame, options.flipped, [0, 0.3, 0]));
}

function staticCamera(options) {
	const requested = options.camera && !["auto", "manual"].includes(options.camera)
		? options.camera
		: "overhead";
	return getCameraPreset(requested);
}

function targetForFrame(frame, flipped, fallback) {
	if (!frame?.move) return Array.isArray(fallback) ? fallback : fallback.target;
	if (frame.check || frame.mate) {
		const threatened = frame.position?.board?.indexOf(`${frame.position.turn}K`);
		if (threatened >= 0) return squareWorld(threatened, flipped, 0.72);
	}
	if (frame.move.promotion) return squareWorld(frame.move.to, flipped, 0.9);
	return moveTarget(frame.move, flipped, frame.move.capture ? 0.58 : 0.4);
}

function varyPose(pose, ply, presetId, intensity) {
	if (intensity === "calm" || presetId === "overhead") return pose;
	const sign = ply % 2 ? 1 : -1;
	const degrees = presetId === "mateReveal" ? sign * 14 : sign * (intensity === "dramatic" ? 6 : 3.5);
	return orbitPose(pose, degrees, 1);
}
