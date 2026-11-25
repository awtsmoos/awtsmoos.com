// B"H — Run 09 unit proof: navigation has ONE owner, the codex Action URL
// mirrors the current selection, and the run09 CSS settlement is imported
// last. Source-level assertions in the style of viewportNavigation.test.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const source = relative => readFileSync(resolve(appRoot, relative), "utf8");

// --- Item 2: exactly one nav-click owner ---------------------------------
const bindNavigation = source("js/router/bindNavigation.js");
assert.match(bindNavigation, /if \(navigationBound\) return;/, "delegated nav binding is one-time guarded");
assert.match(bindNavigation, /data-awt-home/, "delegated handler owns the Home button too");
assert.match(bindNavigation, /activatePane\(node\.dataset\.awtNavigate\)/, "delegated handler activates destinations");

const navigationControls = source("js/shell/navigationControls.js");
const clickListeners = navigationControls.match(/addEventListener\("click"/g) || [];
assert.equal(clickListeners.length, 1, "navigationControls keeps only the Apps toggle's own click listener");
assert.doesNotMatch(navigationControls, /activatePane|showHome/, "nav buttons no longer self-activate");

const dashboardCard = source("js/dashboard/dashboardCard.js");
assert.doesNotMatch(dashboardCard, /addEventListener\("click"/, "launcher tiles no longer self-activate");
assert.match(dashboardCard, /"data-awt-navigate": key/, "tiles still expose their destination to the delegated handler");

// --- Item 3: Action URL preview follows the selection ---------------------
const actions = source("js/features/actions.js");
assert.match(actions, /bindActionUrlPreview\(getTunnelName\)/, "mountActions binds the URL preview");
assert.match(actions, /grid\.addEventListener\("click", refresh\)/, "preview refreshes on catalog selection");
assert.match(actions, /detail\.addEventListener\("input", refresh\)/, "preview refreshes on field edits");
assert.match(actions, /buildFsUrl\(getTunnelName\(\), buildOptions\(\)\)/, "preview builds from the pane's live options");

// --- Items 1/4/5: the run09 CSS settlement exists and lands last ----------
assert.ok(existsSync(resolve(appRoot, "css/run09-fixes.css")), "run09-fixes.css exists");
const appCss = source("css/app.css");
assert.ok(appCss.indexOf("run09-fixes.css") > appCss.indexOf("run08-fixes.css"), "run09 sheet imports after run08");
const fixes = source("css/run09-fixes.css");
assert.match(fixes, /\.awt-mesh-node/, "mesh nodes re-based");
assert.match(fixes, /\.awt-pane-icon/, "pane icon chips re-based");
assert.match(fixes, /\.awt-detail-head/, "detail head wraps");
assert.match(fixes, /awt-home-mode \.awt-dashboard/, "home dashboard anchored");

console.log("B'H run09 unit ok");
