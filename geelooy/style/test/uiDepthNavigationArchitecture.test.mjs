// B"H
/**
 * Chapter: The dock and the depths stand trial.
 * The test verifies that premium depth is centralized in shared tokens and that
 * navigation consumes named z-index, glass, safe dimensions, and motion.
 */
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");
const shadow = read("geelooy/style/foundation/tokens/shadow.css");
const radius = read("geelooy/style/foundation/tokens/radius.css");
const surfaces = read("geelooy/style/social-system/surfaces.css");
const navigation = read("geelooy/style/social-system/navigation.css");

assert.match(shadow, /--z-dropdown/, "depth tokens must include dropdown z layer");
assert.match(shadow, /--z-modal/, "depth tokens must include modal z layer");
assert.match(shadow, /--shadow-dock/, "shadow tokens must include dock depth");
assert.match(radius, /--radius-dock/, "radius tokens must include dock geometry");
assert.match(surfaces, /awt-material-glass/, "surfaces must expose glass material");
assert.match(surfaces, /awt-material-crystal/, "surfaces must expose crystal material");
assert.match(navigation, /var\(--z-dock\)/, "navigation must use named z-index token");
assert.match(navigation, /backdrop-filter/, "navigation must use glass blur");
assert.match(navigation, /min-height:\s*44px/, "navigation links must preserve touch targets");
assert.match(navigation, /max-width:\s*min\(94dvw/, "navigation must avoid viewport overflow");

console.log('B"H uiDepthNavigationArchitecture.test passed');
