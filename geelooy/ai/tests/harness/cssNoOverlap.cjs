//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

const LEGACY_DENY = new Set([
  "css/chat.css", "css/event-cockpit.css", "css/stream-resume-hardening.css",
  "css/thought-freeze-polish.css", "css/thinking-window.css", "css/panel-action-rail.css",
  "css/panel-controls.css", "css/panel-polish.css", "css/mobile/chat-events.css",
  "css/mobile/drawer-overlay.css", "css/mobile/panels.css", "css/mobile/shell.css",
  "css/right-panel/clarity.css", "css/right-panel/spacing.css", "css/right-panel-overlap-kill.css",
  "css/right-panel-menu.css", "css/automation-futuristic.css", "css/automation-cockpit.css",
  "css/automation-form-polish.css", "css/automation-status-compact.css"
]);

const FIXED_ALLOW = new Map([
  ["css/ideal/chat.css", [".live-follow-button"]],
  ["css/ideal/mobile.css", [".main"]],
  ["css/ideal/mobile/revamp.css", ["body", ".sidebar"]],
  ["css/ideal/mobile/scenes.css", [".main", ".sidebar", ".automation-panel"]],
  ["css/ideal/mobile/crown.css", [".mobile-app-crown", ".mobile-bottom-dock"]],
  ["css/ideal/shell.css", [".is-panel-fullscreen"]],
  ["css/right-panel/fullscreen.css", [".is-panel-fullscreen"]],
  ["css/events/panel-chrome.css", [".is-fullscreen"]],
  ["css/vision-engine.css", ["body::before", "body::after"]]
]);

const ABSOLUTE_ALLOW = new Map([
  ["css/atmosphere-engine.css", [".chat-box::before", ".chat-box::after"]],
  ["css/embedded.css", [".input-area", ".mobile-suggestion-rail", ".attachment-tools"]],
  ["css/empty-state.css", [".ai-empty-state::before"]],
  ["css/ideal/shell.css", ["::before", "::after", ".attachment-tools"]],
  ["css/ideal/sidebar.css", ["::before"]],
  ["css/ideal/composer.css", [".input-area"]],
  ["css/ideal/mobile/composer.css", ["#message-input", ".attachment-tools", ".input-area"]],
  ["css/ideal/mobile/crown.css", [".mobile-crown", ".mobile-bottom-dock::before"]],
  ["css/ideal/mobile/suggestions.css", [".mobile-suggestion-rail"]],
  ["css/right-panel/menu.css", [".right-tabs"]],
  ["css/right-panel/toggles.css", [".automation-toggle-row"]],
  ["css/events/thought-run.css", [".event-panel-actions"]],
  ["css/showcase-cards.css", [".showcase-hero-halo", ".showcase-composer-aura", ".mobile-bottom-dock::before"]]
]);

const HIGH_Z_ALLOW = new Map([
  ...FIXED_ALLOW,
  ["css/embedded.css", [".input-area", ".mobile-suggestion-rail", ".attachment-tools"]],
  ["css/events/panel-chrome.css", [".is-fullscreen", ".is-maximized"]],
  ["css/ideal/mobile/composer.css", [".transport-status", ".input-area", ".attachment-tools"]],
  ["css/ideal/mobile/revamp.css", ["body", ".sidebar", ".mobile-bottom-dock", ".input-area"]],
  ["css/ideal/mobile/scenes.css", [".main", ".sidebar", ".automation-panel", ".mobile-scene-active"]],
  ["css/ideal/mobile/suggestions.css", [".mobile-suggestion-rail"]],
  ["css/ideal/shell.css", [".is-panel-fullscreen"]],
  ["css/right-panel/fullscreen.css", [".is-panel-fullscreen"]],
  ["css/right-panel/menu.css", [".right-tabs"]],
  ["css/vision-engine.css", ["body::before", "body::after"]],
  ["css/showcase-cards.css", [".showcase-hero-halo", ".showcase-composer-aura"]]
]);

/**
 * B"H
 * Chapter 396: The High Rails Were Named And Bound.
 *
 * Embedded composer rails and suggestion rails deliberately sit above the chat.
 * The guard now names those rails while still rejecting new unnamed high-z
 * rulers that could cover the cockpit without consent.
 */
async function run() {
  return test("css-no-overlap-law", async () => {
    const active = [...resolveCssImports("styles.css")].filter(file => file.endsWith(".css")).map(norm).sort();
    const importedLegacy = active.filter(file => LEGACY_DENY.has(file));
    const fixedViolations = [], absoluteViolations = [], highZViolations = [];
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
    return { activeCss:active.length, importedLegacy:0, fixedChecked:true, absoluteChecked:true, highZChecked:true };
  });
}

function scanPosition(text, file, kind, allowMap, bucket) {
  for (const block of blocks(text)) {
    if (!new RegExp(`position\\s*:\\s*${kind}`).test(block.body)) continue;
    if (!allowed(file, block.selector, allowMap)) bucket.push({ file, selector:block.selector, kind });
  }
}
function scanHighZ(text, file, bucket) {
  for (const block of blocks(text)) {
    for (const match of block.body.matchAll(/z-index\s*:\s*([0-9]+)/g)) {
      const value = Number(match[1]);
      if (value <= 20 || allowed(file, block.selector, HIGH_Z_ALLOW)) continue;
      bucket.push({ file, selector:block.selector, zIndex:value });
    }
  }
}
function allowed(file, selector, allowMap) { return (allowMap.get(norm(file)) || []).some(needle => selector.includes(needle)); }
function blocks(text) {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...clean.matchAll(/([^{}@][^{}]*)\{([^{}]*)\}/g)].map(match => ({ selector:match[1].trim(), body:match[2] }));
}
function read(file) { return fs.readFileSync(path.join(ROOT, norm(file)), "utf8"); }
function directImports(text) { return [...text.matchAll(/@import\s+"([^"]+)"/g)].map(m => m[1]); }
function resolveCssImports(file, seen = new Set()) {
  const normalized = norm(file);
  if (seen.has(normalized)) return seen;
  seen.add(normalized);
  directImports(read(normalized)).forEach(importPath => resolveCssImports(path.join(path.dirname(normalized), importPath), seen));
  return seen;
}
function norm(file) { return String(file || "").replace(/\\/g, "/"); }

module.exports = { run };
