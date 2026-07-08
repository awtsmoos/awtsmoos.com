// B"H
/**
 * Step 7: Seven gates stand together.
 * The test proves this pass upgraded shared architecture only and did not rely
 * on a forbidden heichelos/post write.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { execSync } from "node:child_process";

const read = file => fs.readFileSync(file, "utf8");
const forms = read("geelooy/style/social-system/forms.css");
const a11y = read("geelooy/style/social-system/accessibility.css");
const type = read("geelooy/style/social-system/typography.css");
const layout = read("geelooy/style/social-system/layout.css");
const grids = read("geelooy/style/social-system/grids.css");
const scroll = read("geelooy/style/awtsmoos-scroll-sovereignty.css");
const home = read("geelooy/style/social/home/foundation.css");

assert.match(forms, /font-size:\s*max\(16px/, "forms must prevent iOS zoom and standardize inputs");
assert.match(a11y, /prefers-reduced-motion/, "accessibility must include reduced-motion mercy");
assert.match(type, /text-wrap:\s*balance/, "typography must include balanced headings");
assert.match(layout, /full-bleed-safe/, "layout must expose safe full-bleed utility");
assert.match(grids, /minmax\(0, 1fr\)/, "grids must use overflow-safe columns");
assert.match(scroll, /max-block-size:\s*calc\(100dvh/, "scroll sovereignty must bound overlays by viewport");
assert.match(home, /shadow-card-hover/, "home foundation must consume shared depth tokens");

const changed = execSync("git diff --name-only", { encoding: "utf8" }).trim().split(/\n/).filter(Boolean);
assert.equal(changed.some(file => file.startsWith("geelooy/heichelos/post/")), false, "forbidden heichelos/post path was touched");
console.log('B"H uiSevenStepArchitecture.test passed');
