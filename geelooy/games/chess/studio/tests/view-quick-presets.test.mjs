//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Locks quick-view promises to readable ordinary native modes and an explicitly dramatic cinema exception.
 * The Awtsmoos lets one thumb choose a finite garment while the legal board remains one beneath every view;
 * Awtsmoos.com keeps Top-down, Readable, and Broadcast calm enough for phones while Cinema alone asks drama to shine through.
 */
import assert from "node:assert/strict";
import { applyViewQuickPreset, VIEW_QUICK_PRESETS } from "../ui/viewQuickPresets.js";

const preferences = {};
applyViewQuickPreset(preferences, "instant2d");
assert.equal(preferences.renderer, "canvas2d");
assert.equal(preferences.previewMotion, "instant");
assert.equal(preferences.canvasPieceStyle, "crisp");

applyViewQuickPreset(preferences, "royal2d");
assert.equal(preferences.canvasStyle, "parchment");
assert.equal(preferences.canvasPieceStyle, "soft");
assert.equal(preferences.characters, "royal");

for (const id of ["topdown3d", "readable3d", "broadcast3d"]) {
	const selected = applyViewQuickPreset(preferences, id);
	assert.equal(selected.options.renderer, "procedural3d");
	assert.equal(preferences.cameraMotion, "static");
	assert.equal(preferences.cameraIntensity, "calm");
	assert.equal(preferences.lighting, "readability");
	assert.equal(preferences.environment, "readability");
	assert.equal(preferences.piecePalette, "readable");
	assert.equal(preferences.pieceScale, 0.82);
	assert.equal(preferences.fog, false);
}

applyViewQuickPreset(preferences, "cinema3d");
assert.equal(preferences.renderer, "procedural3d");
assert.equal(preferences.camera, "auto");
assert.equal(preferences.cameraMotion, "director");
assert.equal(preferences.cameraIntensity, "balanced");
assert.equal(preferences.lighting, "studio");
assert.equal(preferences.environment, "clarity");
assert.equal(preferences.pieceScale, 0.86);
assert.ok(VIEW_QUICK_PRESETS.crisp2d);
console.log("VIEW_QUICK_PRESETS_PASS");
