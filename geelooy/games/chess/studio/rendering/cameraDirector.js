//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Directs semantic cameras, then proves automatic shots readable before allowing them onto phone or movie screens.
 * The Awtsmoos lets meaning guide the watching eye while safety weighs each cinematic vessel before it can conceal the board;
 * Awtsmoos.com preserves manual freedom yet makes Auto Director answer to active squares, fit, and elevation on every road.
 */
import { getCameraPreset } from "./cameraPresets.js";
import { orbitPose, withTarget } from "./cameraMath.js";
import { protectDirectedCamera } from "./cameraSafety.js";
import { semanticPreset, semanticTarget } from "./cameraSemantics.js";

const CALM_ANGLES = Object.freeze(["topDown3d", "broadcastWhite", "birdseyeWhite", "broadcastBlack"]);
const BALANCED_ANGLES = Object.freeze(["diagonalLeft", "tactical", "diagonalRight", "birdseyeWhite", "whiteCorner", "sideRight"]);
const DRAMATIC_ANGLES = Object.freeze(["lowBoard", "rookRail", "queenOrbit", "whiteCorner", "blackCorner", "tactical"]);

export function directCamera(frame, options = {}) {
	const intensity = options.intensity || "balanced";
	const presetId = choosePreset(frame, intensity);
	const targeted = withTarget(getCameraPreset(presetId), semanticTarget(frame, Boolean(options.flipped)));
	const varied = varyPose(targeted, frame?.ply || 0, presetId, intensity, frame?.event?.importance || 0);
	return protectDirectedCamera(frame, varied, { ...options, intensity });
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
	if (!move) return "topDown3d";
	if (frame.mate) return "mateReveal";
	if (move.promotion) return "promotionHero";
	if (move.castle) return "castleSweep";
	if (frame.check) return "kingFocus";
	if (move.capture) return intensity === "dramatic" ? "captureClose" : "tactical";
	const semantic = semanticPreset(frame, intensity);
	if (semantic && safeSemantic(semantic, intensity)) return semantic;
	const angles = intensity === "dramatic" ? DRAMATIC_ANGLES : intensity === "calm" ? CALM_ANGLES : BALANCED_ANGLES;
	return angles[(frame?.ply || 0) % angles.length];
}

function safeSemantic(preset, intensity) {
	return intensity === "dramatic" || !["lowBoard", "rookRail", "captureClose"].includes(preset);
}

function orbitCamera(frame, options) {
	const base = withTarget(getCameraPreset("queenOrbit"), semanticTarget(frame, Boolean(options.flipped)));
	return orbitPose(base, ((frame?.ply || 0) * 20 + (options.flipped ? 180 : 0)) % 360, 1.04);
}

function zoomCamera(frame, options) {
	const id = frame?.move?.capture ? "captureClose" : "tactical";
	return orbitPose(withTarget(getCameraPreset(id), semanticTarget(frame, Boolean(options.flipped))), (frame?.ply || 0) % 2 ? 4 : -4, 0.9);
}

function broadcastCamera(frame, options) {
	const id = options.flipped ? "broadcastBlack" : "broadcastWhite";
	return withTarget(getCameraPreset(id), semanticTarget(frame, Boolean(options.flipped)));
}

function staticCamera(options) {
	const requested = options.camera && !["auto", "manual"].includes(options.camera) ? options.camera : "topDown3d";
	return getCameraPreset(requested);
}

function varyPose(pose, ply, presetId, intensity, importance) {
	if (intensity === "calm" || ["overhead", "topDown3d"].includes(presetId)) return pose;
	const sign = ply % 2 ? 1 : -1;
	const degrees = presetId === "mateReveal" ? 10 : intensity === "dramatic" ? 5 : 2.5;
	return orbitPose(pose, sign * degrees * (1 + Math.min(0.3, importance / 260)), importance >= 70 ? 0.97 : 1);
}
