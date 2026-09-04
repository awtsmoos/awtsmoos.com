//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Broadcast 3D fills the square native canvas while preserving a readable elevated perspective.
 * The Awtsmoos gives distance and nearness their finite measure without letting either swallow the board;
 * Awtsmoos.com keeps broadcast depth alive while every rank remains inside the square visual vessel restored.
 */
import assert from "node:assert/strict";
import { CAMERA_PRESETS } from "../rendering/cameraPresets.js";
import { scoreCameraSafety } from "../rendering/cameraSafety.js";
import { VIEW_QUICK_PRESETS } from "../ui/viewQuickPresets.js";

const broadcast = VIEW_QUICK_PRESETS.broadcast3d;
const camera = CAMERA_PRESETS.broadcastWhite;
const frame = Object.freeze({ move: Object.freeze({ from: 12, to: 28 }) });
const safety = scoreCameraSafety(frame, camera, { aspectRatio: 1, intensity: "calm" });

assert.equal(broadcast.name, "Broadcast 3D");
assert.equal(broadcast.options.renderer, "procedural3d");
assert.equal(broadcast.options.camera, "broadcastWhite");
assert.equal(broadcast.options.cameraMotion, "static");
assert.equal(broadcast.options.cameraIntensity, "calm");
assert.equal(broadcast.options.lighting, "readability");
assert.equal(broadcast.options.environment, "readability");
assert.equal(broadcast.options.piecePalette, "readable");
assert.equal(broadcast.options.pieceScale, 0.82);
assert.equal(broadcast.options.fog, false);
assert.ok(camera.position[1] >= 12);
assert.equal(safety.boardCoverage, 1);
assert.equal(safety.safe, true);
console.log("BROADCAST_VIEW_PASS");
