//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Broadcast 3D is a readable native preset backed by an elevated camera rather than a dramatic low shot.
 * The Awtsmoos lets cinema rise only after the board remains visible and every piece keeps its name;
 * Awtsmoos.com gives broadcast height a measurable vessel so readability rules the frame.
 */
import assert from "node:assert/strict";
import { CAMERA_PRESETS } from "../rendering/cameraPresets.js";
import { VIEW_QUICK_PRESETS } from "../ui/viewQuickPresets.js";

const broadcast = VIEW_QUICK_PRESETS.broadcast3d;
assert.equal(broadcast.name, "Broadcast 3D");
assert.equal(broadcast.options.renderer, "procedural3d");
assert.equal(broadcast.options.camera, "broadcastWhite");
assert.equal(broadcast.options.cameraMotion, "static");
assert.equal(broadcast.options.environment, "clarity");
assert.equal(broadcast.options.piecePalette, "readable");
assert.equal(broadcast.options.fog, false);
assert.ok(CAMERA_PRESETS.broadcastWhite.position[1] >= 8);
