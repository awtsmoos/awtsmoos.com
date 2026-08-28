//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Directs semantic shots plus explicit orbit, zoom, broadcast, and static motion from one MoveEvent stream.
 * The Awtsmoos lets legal meaning guide the watching eye while every angle remains deterministic and true;
 * Awtsmoos.com makes preview and cinema share one director instead of rediscovering the move anew.
 */
import { getCameraPreset } from "./cameraPresets.js";
import { orbitPose, withTarget } from "./cameraMath.js";
import { semanticPreset, semanticTarget } from "./cameraSemantics.js";

const BALANCED_ANGLES = Object.freeze(["diagonalLeft", "tactical", "diagonalRight", "rookRail", "queenOrbit", "sideLeft", "whiteCorner", "sideRight"]);
const DRAMATIC_ANGLES = Object.freeze(["lowBoard", "rookRail", "queenOrbit", "whiteCorner", "blackCorner", "tactical"]);

/** Chooses the automatic semantic camera pose for one frame. */
export function directCamera(frame, options = {}) {
	const intensity = options.intensity || "balanced";
	const presetId = choosePreset(frame, intensity);
	const pose = withTarget(getCameraPreset(presetId), semanticTarget(frame, Boolean(options.flipped)));
	return varyPose(pose, frame?.ply || 0, presetId, intensity, frame?.event?.importance || 0);
}

/** Applies an explicit motion personality or automatic director. */
export function directCameraMotion(frame, options = {}) {
	const motion = options.cameraMotion || "director";
	if (motion === "orbit") return orbitCamera(frame, options);
	if (motion === "zoom") return zoomCamera(frame, options);
	if (motion === "broadcast") return broadcastCamera(frame, options);
	if (motion === "static") return staticCamera(options);
	return directCamera(frame, options);
}

/** Selects a camera preset with forcing moves first, then deterministic semantic geometry. */
export function choosePreset(frame, intensity = "balanced") {
	const move = frame?.move;
	if (!move) return "birdseyeWhite";
	if (frame.mate) return "mateReveal";
	if (move.promotion) return "promotionHero";
	if (move.castle) return "castleSweep";
	if (frame.check) return "kingFocus";
	if (move.capture) return "captureClose";
	const semantic = semanticPreset(frame, intensity);
	if (semantic) return semantic;
	if (intensity === "calm") return frame.ply % 2 ? "broadcastWhite" : "broadcastBlack";
	const angles = intensity === "dramatic" ? DRAMATIC_ANGLES : BALANCED_ANGLES;
	return angles[frame.ply % angles.length];
}

function orbitCamera(frame, options) {
	const base = withTarget(getCameraPreset("queenOrbit"), semanticTarget(frame, Boolean(options.flipped)));
	return orbitPose(base, ((frame?.ply || 0) * 24 + (options.flipped ? 180 : 0)) % 360, 1.08);
}

function zoomCamera(frame, options) {
	const base = withTarget(getCameraPreset(frame?.move?.capture ? "captureClose" : "tactical"), semanticTarget(frame, Boolean(options.flipped)));
	return orbitPose(base, (frame?.ply || 0) % 2 ? 5 : -5, 0.72);
}

function broadcastCamera(frame, options) {
	const preset = options.flipped ? "broadcastBlack" : "broadcastWhite";
	return withTarget(getCameraPreset(preset), semanticTarget(frame, Boolean(options.flipped)));
}

function staticCamera(options) {
	const requested = options.camera && !["auto", "manual"].includes(options.camera) ? options.camera : "overhead";
	return getCameraPreset(requested);
}

function varyPose(pose, ply, presetId, intensity, importance) {
	if (intensity === "calm" || presetId === "overhead") return pose;
	const sign = ply % 2 ? 1 : -1;
	const baseDegrees = presetId === "mateReveal" ? 14 : intensity === "dramatic" ? 6 : 3.5;
	const emphasis = 1 + Math.min(0.45, importance / 220);
	return orbitPose(pose, sign * baseDegrees * emphasis, importance >= 60 ? 0.94 : 1);
}
