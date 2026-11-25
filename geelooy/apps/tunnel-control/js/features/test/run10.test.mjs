// B"H — Run 10 unit proof: the full room's pane-content is a block scroller
// (not the card-deck grid that squeezed the status bar to half height), the
// room notice can never be row-squeezed again, and the home dashboard is a
// content-sized flex column whose launcher keeps its full height. The real
// geometry proof lives in the live-context harness (tests/run10-live.html);
// these are the source-level guards in the style of run09.test.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const source = relative => readFileSync(resolve(appRoot, relative), "utf8");

// --- The run10 CSS settlement exists and lands last -----------------------
assert.ok(existsSync(resolve(appRoot, "css/run10-fixes.css")), "run10-fixes.css exists");
const appCss = source("css/app.css");
assert.ok(appCss.indexOf("run10-fixes.css") > appCss.indexOf("run09-fixes.css"), "run10 sheet imports after run09");
const fixes = source("css/run10-fixes.css");

// --- Item 1: full room — block scroller + unsqueezable status bar ---------
assert.match(fixes, /\[data-pane="liveRoom"\] \.awt-pane-content \{\s*display: block;/, "liveRoom pane-content is a block scroller, not the deck grid");
assert.match(fixes, /\.awt-room-panel > \.notice \{\s*min-height: max-content;/, "room status bar keeps its full content height");

// --- Item 2: home — flex column, content-sized children, whole launcher ---
assert.match(fixes, /body\.awt-home-mode \.awt-dashboard \{\s*display: flex;/, "home dashboard is a flex column");
assert.match(fixes, /flex: 0 0 auto;/, "home card and launcher never shrink below content");
assert.match(fixes, /\.awt-launcher-grid \{\s*max-height: none;\s*overflow: visible;/, "launcher grid keeps its full height on home");

console.log("run10 unit: PASS");
