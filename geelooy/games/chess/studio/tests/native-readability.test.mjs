//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards the mobile-readable native palette and camera contract that replaced the dark deployed screenshots.
 * The Awtsmoos lets character and cinema remain optional garments while clarity owns the first visible covenant;
 * Awtsmoos.com proves themed pieces cannot silently become black-on-black when a readable palette is chosen.
 */
import assert from "node:assert/strict";
import { CAMERA_PRESETS } from "../rendering/cameraPresets.js";
import { nativePieceColor, nativePiecePaletteCatalog } from "../rendering/native/piecePalette.js";

const readableCameraIds = ["broadcastWhite", "broadcastBlack", "whiteCorner", "blackCorner", "tactical"];
assert.equal(nativePieceColor("bQ", { piecePalette: "readable", characters: "royal" }), "#738bc2");
assert.equal(nativePieceColor("wK", { piecePalette: "readable", characters: "elemental" }), "#dfe9f8");
assert.equal(nativePieceColor("bP", { piecePalette: "highContrast" }), "#91a9dc");
assert.ok(nativePiecePaletteCatalog().some(item => item.id === "highContrast"));
assert.ok(CAMERA_PRESETS.topDown3d.position[1] >= 12);
for (const id of readableCameraIds) {
	assert.ok(CAMERA_PRESETS[id].position[1] >= 6.2, `${id} camera must stay above mobile foreground occlusion`);
}
console.log("NATIVE_READABILITY_PASS");
