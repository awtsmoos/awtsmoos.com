//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards native side contrast and square-canvas camera framing instead of freezing washed-out historical colors.
 * The Awtsmoos lets ivory and shadow keep their finite distinction while every piece remains the same lawful game;
 * Awtsmoos.com measures readable value and square framing so phones never return to pale armies or distant flame.
 */
import assert from "node:assert/strict";
import { CAMERA_PRESETS } from "../rendering/cameraPresets.js";
import { scoreCameraSafety } from "../rendering/cameraSafety.js";
import { nativePieceColor, nativePiecePaletteCatalog } from "../rendering/native/piecePalette.js";

const readableWhite = nativePieceColor("wK", { piecePalette: "readable", characters: "elemental" });
const readableBlack = nativePieceColor("bQ", { piecePalette: "readable", characters: "royal" });
const contrastWhite = nativePieceColor("wP", { piecePalette: "highContrast" });
const contrastBlack = nativePieceColor("bP", { piecePalette: "highContrast" });

assert.notEqual(readableWhite.toLowerCase(), "#ffffff");
assert.ok(luminance(readableWhite) - luminance(readableBlack) > 0.45);
assert.ok(luminance(contrastWhite) - luminance(contrastBlack) > 0.65);
assert.ok(nativePiecePaletteCatalog().some(item => item.id === "highContrast"));

const frame = Object.freeze({ move: Object.freeze({ from: 12, to: 28 }) });
for (const id of ["topDown3d", "birdseyeWhite", "broadcastWhite", "broadcastBlack"]) {
	const camera = CAMERA_PRESETS[id];
	const safety = scoreCameraSafety(frame, camera, { aspectRatio: 1, intensity: "calm" });
	assert.ok(camera.position[1] >= 12, `${id} must stay above foreground occlusion`);
	assert.equal(safety.boardCoverage, 1, `${id} must keep the board inside the square native canvas`);
}
console.log("NATIVE_READABILITY_PASS");

function luminance(hex) {
	const channels = hex.slice(1).match(/.{2}/g).map(value => Number.parseInt(value, 16) / 255);
	const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
	return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
