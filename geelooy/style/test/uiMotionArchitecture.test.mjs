// B"H
/**
 * Chapter: The motion court asks whether beauty has architecture.
 * The test does not admire pixels; it verifies that shared files own the hover,
 * glass, depth, reduced-motion, and component contracts instead of page patches.
 */
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");

const motion = read("geelooy/style/foundation/tokens/motion.css");
const effects = read("geelooy/style/foundation/effects/index.css");
const glass = read("geelooy/style/foundation/effects/glass.css");
const buttons = read("geelooy/style/social-system/buttons.css");
const cards = read("geelooy/style/social-system/cards.css");

assert.match(motion, /--motion-perspective/, "motion tokens must expose 3D perspective");
assert.match(motion, /prefers-reduced-motion/, "motion tokens must honor reduced motion");
assert.match(effects, /awt-hover-lift/, "effects must define shared hover lift utility");
assert.match(effects, /rotateX\(var\(--motion-tilt-x\)\)/, "effects must define shared 3D tilt");
assert.match(effects, /@keyframes awt-slide-in/, "effects must define shared slide animation");
assert.match(glass, /backdrop-filter/, "glass utility must include backdrop blur");
assert.match(glass, /@supports not/, "glass utility must provide fallback");
assert.match(buttons, /min-height:\s*44px/, "buttons must keep 44px touch target");
assert.match(buttons, /translateY\(var\(--motion-hover-lift\)\)/, "buttons must consume shared hover motion");
assert.match(cards, /var\(--motion-shadow-lift\)/, "cards must consume shared depth token");
assert.match(cards, /rotateY\(var\(--motion-tilt-y\)\)/, "cards must consume shared 3D tilt token");

console.log('B"H uiMotionArchitecture.test passed');
