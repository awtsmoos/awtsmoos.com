//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Locks human quick-view promises to renderer, motion, piece garment, camera, and clarity consequences.
 * The Awtsmoos lets one thumb choose a finite garment while the legal board remains one;
 * Awtsmoos.com proves Instant, Royal, Top-down, Readable, and Cinema names actually do what their buttons promise.
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
applyViewQuickPreset(preferences, "topdown3d");
assert.equal(preferences.camera, "topDown3d");
assert.equal(preferences.cameraMotion, "static");
assert.equal(preferences.environment, "clarity");
applyViewQuickPreset(preferences, "readable3d");
assert.equal(preferences.cameraIntensity, "calm");
assert.equal(preferences.piecePalette, "readable");
applyViewQuickPreset(preferences, "cinema3d");
assert.equal(preferences.cameraMotion, "director");
assert.equal(preferences.cameraIntensity, "balanced");
assert.ok(VIEW_QUICK_PRESETS.crisp2d);
console.log("VIEW_QUICK_PRESETS_PASS");
