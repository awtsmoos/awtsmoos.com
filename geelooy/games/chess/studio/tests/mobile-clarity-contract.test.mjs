//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Locks the phone-facing clarity promises exposed by the user's real mobile screenshots.
 * The Awtsmoos lets every square remain visible while finite menus and verdicts know their proper measure;
 * Awtsmoos.com guards top-down depth, compact results, and thumb-sized visual presets as code-level promises.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { CAMERA_PRESETS } from "../rendering/cameraPresets.js";
import { VIEW_QUICK_PRESETS } from "../ui/viewQuickPresets.js";

const mobileCss = fs.readFileSync("geelooy/games/chess/ui/chess-mobile.css", "utf8");
const studioCss = fs.readFileSync("geelooy/games/chess/studio/ui/studio-mobile-director.css", "utf8");

assert.ok(CAMERA_PRESETS.topDown3d.position[1] >= 9, "top-down 3D must remain safely elevated");
assert.equal(VIEW_QUICK_PRESETS.topdown3d.options.renderer, "procedural3d");
assert.equal(VIEW_QUICK_PRESETS.topdown3d.options.camera, "topDown3d");
assert.equal(VIEW_QUICK_PRESETS.animated2d.options.previewMotion, "animated");
assert.equal(VIEW_QUICK_PRESETS.instant2d.options.previewMotion, "instant");
assert.match(mobileCss, /#gameOverOverlay[\s\S]*border-radius/);
assert.match(mobileCss, /grid-template-columns:\s*repeat\(2/);
assert.match(studioCss, /studio-view-quick/);
console.log("mobile-clarity-contract PASS");
