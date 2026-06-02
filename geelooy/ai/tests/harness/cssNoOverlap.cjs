//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

const LEGACY_DENY = new Set([
  "css/chat.css",
  "css/event-cockpit.css",
  "css/stream-resume-hardening.css",
  "css/thought-freeze-polish.css",
  "css/thinking-window.css",
  "css/panel-action-rail.css",
  "css/panel-controls.css",
  "css/panel-polish.css",
  "css/mobile/chat-events.css",
  "css/mobile/drawer-overlay.css",
  "css/mobile/panels.css",
  "css/mobile/shell.css",
  "css/right-panel/clarity.css",
  "css/right-panel/spacing.css",
  "css/right-panel-overlap-kill.css",
  "css/right-panel-menu.css",
  "css/automation-futuristic.css",
  "css/automation-cockpit.css",
  "css/automation-form-polish.css",
  "css/automation-status-compact.css"
]);

const FIXED_ALLOW = new Map([
  ["css/ideal/chat.css", [".live-follow-button"]],
  ["css/ideal/mobile.css", [".main"]],
  ["css/ideal/mobile/revamp.css", ["body", ".sidebar"]],
  ["css/ideal/mobile/scenes.css", [".main", ".sidebar", ".automation-panel"]],
  ["css/ideal/mobile/crown.css", [".mobile-bottom-dock"]],
  ["css/ideal/shell.css", [".is-panel-fullscreen"]],
  ["css/right-panel/fullscreen.css", [".is-panel-fullscreen"]],
  ["css/events/panel-chrome.css", [".is-fullscreen"]]
]);

const ABSOLUTE_ALLOW = new Map([
  ["css/ideal/shell.css", ["::before", "::after", ".attachment-tools"]],
  ["css/ideal/sidebar.css", ["::before"]],
  ["css/ideal/composer.css", [".input-area"]],
  ["css/ideal/mobile/composer.css", ["#message-input", ".attachment-tools"]],
  ["css/ideal/mobile/crown.css", [".mobile-crown", ".mobile-bottom-dock::before"]],
  ["css/right-panel/menu.css", [".right-tabs"]],
  ["css/right-panel/toggles.css", [".automation-toggle-row"]],
  ["css/events/thought-run.css", [".event-panel-actions"]]
]);

const HIGH_Z_ALLOW = new Map([
  ...FIXED_ALLOW,
  ["css/events/panel-chrome.css", [".is-fullscreen", ".is-maximized"]],
  ["css/ideal/mobile/composer.css", [".transport-status", ".input-area", ".attachment-tools"]],
  ["css/ideal/mobile/revamp.css", ["body", ".sidebar", ".mobile-bottom-dock", ".input-area"]],
  ["css/ideal/mobile/scenes.css", [".main", ".sidebar", ".automation-panel", ".mobile-scene-active"]],
  ["css/ideal/shell.css", [".is-panel-fullscreen"]],
  ["css/right-panel/fullscreen.css", [".is-panel-fullscreen"]],
  ["css/right-panel/menu.css", [".right-tabs"]]
]);

/**
 * B"H
 * Chapter 311: The High Crowns Were Counted And Named.
 *
 * The Awtsmoos lets some UI vessels rise: active mobile scene, composer, menu,
 * maximized trace, fullscreen panel. These are not accidents; they are named
 * crowns. Any unnamed crown is still rejected before it can overlap the palace.
 *
 * @returns {Promise<object>} facts proving the active CSS has declared overlay law.
 */
async function run() {
  return test("css-no-overlap-law", async () => {
    const active = [...resolveCssImports("styles.css")].filter(file => file.endsWith(".css")).sort();
    const importedLegacy = active.filter(file => LEGACY_DENY.has(file));
    const fixedViolations = [];
    const absoluteViolations = [];
    const highZViolations = [];

    for (const file of active) {
      const text = read(file);
      scanPosition(text, file, "fixed", FIXED_ALLOW, fixedViolations);
      scanPosition(text, file, "absolute", ABSOLUTE_ALLOW, absoluteViolations);
      scanHighZ(text, file, highZViolations);
    }

    assert(importedLegacy.length === 0, "high-risk legacy CSS must not be active", { importedLegacy });
    assert(fixedViolations.length === 0, "active CSS has undeclared fixed positioning", { fixedViolations });
    assert(absoluteViolations.length === 0, "active CSS has undeclared absolute positioning", { absoluteViolations });
    assert(highZViolations.length === 0, "active CSS has undeclared z-index above 20", { highZViolations });
    return { activeCss: active.length, importedLegacy: 0, fixedChecked: true, absoluteChecked: true, highZChecked: true };
  });
}

function scanPosition(text, file, kind, allowMap, bucket) {
  for (const block of blocks(text)) {
    if (!new RegExp(`position\\s*:\\s*${kind}`).test(block.body)) continue;
    if (!allowed(file, block.selector, allowMap)) bucket.push({ file, selector: block.selector, kind });
  }
}
function scanHighZ(text, file, bucket) {
  for (const block of blocks(text)) {
    for (const match of block.body.matchAll(/z-index\s*:\s*([0-9]+)/g)) {
      const value = Number(match[1]);
      if (value <= 20 || allowed(file, block.selector, HIGH_Z_ALLOW)) continue;
      bucket.push({ file, selector: block.selector, zIndex: value });
    }
  }
}
function allowed(file, selector, allowMap) {
  const allowedNeedles = allowMap.get(file) || [];
  return allowedNeedles.some(needle => selector.includes(needle));
}
function blocks(text) {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const result = [];
  for (const match of clean.matchAll(/([^{}@][^{}]*)\{([^{}]*)\}/g)) {
    result.push({ selector: match[1].trim(), body: match[2] });
  }
  return result;
}
function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function directImports(text) { return [...text.matchAll(/@import\s+"([^"]+)"/g)].map(m => m[1]); }
function resolveCssImports(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  directImports(read(file)).forEach(importPath => resolveCssImports(path.normalize(path.join(path.dirname(file), importPath)), seen));
  return seen;
}

module.exports = { run };
