//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Locks mobile native 3D to the square canvas actually rendered inside the tall phone page.
 * The Awtsmoos surrounds the square vessel with a taller world yet lets each finite piece remain inside its measured ray;
 * Awtsmoos.com guards contrast, breathing room, and full-volume framing so readable chess stays neither clipped nor lost away.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { CAMERA_PRESETS } from "../rendering/cameraPresets.js";
import { projectCameraPoint } from "../rendering/cameraSafetyProjection.js";
import { scoreCameraSafety } from "../rendering/cameraSafety.js";
import { LIGHTING_PRESETS } from "../rendering/lightingPresets.js";
import { PROCEDURAL_DEFAULT_OPTIONS } from "../rendering/proceduralOptions.js";
import { NATIVE_ENVIRONMENTS } from "../rendering/native/environmentPresets.js";
import { nativePieceColor } from "../rendering/native/piecePalette.js";
import { VIEW_QUICK_PRESETS } from "../ui/viewQuickPresets.js";

const FRAME = Object.freeze({ move: Object.freeze({ from: 12, to: 28 }) });

test("readable palette has a large mobile luminance gap without pure white", () => {
	const white = nativePieceColor("wP", { piecePalette: "readable" });
	const black = nativePieceColor("bP", { piecePalette: "readable" });
	assert.notEqual(white.toLowerCase(), "#ffffff");
	assert.ok(luminance(white) - luminance(black) > 0.45);
});

test("ordinary native defaults prefer stable readability over auto-director drama", () => {
	assert.equal(PROCEDURAL_DEFAULT_OPTIONS.camera, "birdseyeWhite");
	assert.equal(PROCEDURAL_DEFAULT_OPTIONS.cameraMotion, "static");
	assert.equal(PROCEDURAL_DEFAULT_OPTIONS.lighting, "readability");
	assert.equal(PROCEDURAL_DEFAULT_OPTIONS.environment, "readability");
	assert.ok(PROCEDURAL_DEFAULT_OPTIONS.pieceScale <= 0.82);
});

test("readable quick preset fills the square native canvas while protecting tall pieces", () => {
	const preset = VIEW_QUICK_PRESETS.readable3d.options;
	const camera = CAMERA_PRESETS[preset.camera];
	const safety = scoreCameraSafety(FRAME, camera, { aspectRatio: 1, intensity: preset.cameraIntensity });
	const extent = projectedVolumeExtent(camera);
	assert.equal(preset.cameraMotion, "static");
	assert.equal(preset.lighting, "readability");
	assert.equal(preset.environment, "readability");
	assert.equal(safety.boardCoverage, 1);
	assert.equal(safety.safe, true);
	assert.ok(extent.board >= 0.75 && extent.board <= 0.88);
	assert.ok(extent.volume <= 0.92);
});

test("readability light and environment are materially calmer than bright studio", () => {
	assert.ok(LIGHTING_PRESETS.readability.key < LIGHTING_PRESETS.studio.key);
	assert.ok(LIGHTING_PRESETS.readability.fill < LIGHTING_PRESETS.studio.fill);
	assert.ok(NATIVE_ENVIRONMENTS.readability.exposure < NATIVE_ENVIRONMENTS.clarity.exposure);
});

function projectedVolumeExtent(camera) {
	const board = [];
	const volume = [];
	for (const x of [-4, 4]) {
		for (const z of [-4, 4]) {
			board.push([x, 0, z]);
			volume.push([x, 0, z], [x, 2.4, z]);
		}
	}
	const extent = points => Math.max(...points.flatMap(point => {
		const projected = projectCameraPoint(point, camera, 1);
		return [Math.abs(projected.x), Math.abs(projected.y)];
	}));
	return { board: extent(board), volume: extent(volume) };
}

function luminance(hex) {
	const channels = hex.slice(1).match(/.{2}/g).map(value => Number.parseInt(value, 16) / 255);
	const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
	return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
