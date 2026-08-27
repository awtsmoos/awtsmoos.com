//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H
 * Chapter 359: The Cascade Guard Recognized The Mobile Manifest As A Gate.
 *
 * The Awtsmoos reads every active CSS gate, then asks whether the living river
 * contains legacy ghosts, forceful declarations, missing event chambers, or a
 * mobile overlap seal placed before the storm. The mobile manifest itself now
 * imports only; scene motion lives in `mobile/scenes.css`.
 *
 * @returns {Promise<object>} verified cascade facts.
 */
async function run() {
  return test("css-and-entrypoint-parity", async () => {
    const styles = read("styles.css");
    const imports = directImports(styles);
    const eventsManifest = read("css/events/manifest.css");
    const eventImports = directImports(eventsManifest);
    const activeCss = [...resolveCssImports("styles.css")].filter(file => file.endsWith(".css")).sort();
    const allCss = walkCss(path.join(ROOT, "css"));
    const activeImportant = activeCss.filter(file => /!important/.test(read(file)));
    const missing = activeCss.filter(file => !fs.existsSync(path.join(ROOT, file)));
    const unbalancedAll = allCss.filter(file => !balanced(read(file)));
    const legacyActive = activeCss.filter(file => legacyDeny().includes(file));
    const rightManifest = read("css/right-panel/manifest.css");
    const overlapSeal = read("css/right-panel/mobile-overlap-kill.css");
    const mobileAutomationFlow = read("css/right-panel/mobile-automation-flow.css");
    const mobile = read("css/ideal/mobile.css");
    const scenes = read("css/ideal/mobile/scenes.css");
    const revamp = read("css/ideal/mobile/revamp.css");
    const idealTokens = read("css/ideal/tokens.css");
    const idealShell = read("css/ideal/shell.css");
    const idealChat = read("css/ideal/chat.css");
    const idealComposer = read("css/ideal/composer.css");
    const panel = read("js/automation/panel.js");
    const promptJs = read("prompt.js");
    const promptAssets = read("promptAssets.js");
    const index = read("index.js");
    const appMain = read("app-main.js");
    const bg = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/background.js"), "utf8");
    const bgHandlers = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/backgroundHandlers.js"), "utf8");

    assert(isManifestOnly(styles), "styles.css must remain a cascade manifest");
    assert(JSON.stringify(imports) === JSON.stringify(expectedImports()), "top-level CSS imports must remain ordered", { imports });
    assert(JSON.stringify(eventImports) === JSON.stringify(expectedEventImports()), "event CSS manifest imports must remain ordered", { eventImports });
    assert(missing.length === 0, "CSS import missing", { missing });
    assert(unbalancedAll.length === 0, "Every CSS file under geelooy/ai/css must have balanced braces", { unbalancedAll });
    assert(allCss.length >= 88, "CSS forest audit must include event modules", { count: allCss.length });
    assert(activeImportant.length === 0, "active CSS must not contain !important declarations", { activeImportant });
    assert(legacyActive.length === 0, "high-risk legacy CSS must not be active", { legacyActive });
    assert(activeCss.includes("css/events/manifest.css"), "events manifest must be live in the cascade", { activeCss });
    assert(activeCss.includes("css/events/thought-run.css"), "thought run CSS must be live in the cascade", { activeCss });
    assert(activeCss.includes("css/events/thought-stepper.css"), "thought stepper CSS must be live in the cascade", { activeCss });
    assert(activeCss.includes("css/events/tool-terminal.css"), "tool terminal CSS must be live in the cascade", { activeCss });
    assert(activeCss.includes("css/events/file-review.css"), "file review CSS must be live in the cascade", { activeCss });
    assert(!activeCss.includes("css/unified-events.css"), "old unified event CSS must not remain active", { activeCss });
    assert(imports.indexOf("./css/events/manifest.css") > imports.indexOf("./css/right-panel/manifest.css"), "event palace must load after right-panel base");
    assert(imports.indexOf("./css/events/manifest.css") < imports.indexOf("./css/ideal/mobile.css"), "mobile polish must follow event palace");
    assert(imports.at(-1) === "./css/right-panel/mobile-overlap-kill.css", "mobile overlap seal must be final top-level import", { imports });
    assert(/mobile-overlap-kill\.css";\s*$/m.test(rightManifest), "right-panel mobile overlap seal must remain final right-panel import");
    assert(/#automation-panel \.right-panel-body[\s\S]*overflow-y:auto/.test(mobileAutomationFlow), "mobile panel body must own vertical scroll");
    assert(/#automation-panel[\s\S]*\.automation-status[\s\S]*position:static/.test(mobileAutomationFlow), "mobile status pill must not cover controls");
    assert(/#automation-panel \.automation-stop-button[\s\S]*position:static/.test(mobileAutomationFlow), "mobile stop button must not float over forms");
    assert(!/event-region|thought-envelope-card|tool-window/.test(revamp), "mobile revamp must not own event/thought/tool internals");
    assert(/@import "\.\/mobile\/revamp\.css"/.test(mobile), "mobile revamp must stay imported");
    assert(/position:\s*fixed/.test(scenes) && /data-mobile-scene/.test(scenes), "mobile scenes must use reachable fixed drawers");
    assert(/env\(safe-area-inset-top\)/.test(idealTokens + mobile + revamp), "mobile shell must respect safe-area top inset");
    assert(/env\(safe-area-inset-bottom\)/.test(idealTokens + mobile + revamp), "mobile surfaces must respect safe-area bottom inset");
    assert(/mobile-bottom-dock/.test(read("css/ideal/mobile/crown.css")), "mobile dock must be present");
    assert(/--awt-send-min:\s*5[6-9]px/.test(idealTokens) && /#send-button\{[\s\S]*min-height:var\(--awt-send-min\)/.test(idealComposer), "send button touch target must stay above 44px");
    assert(/promptStyle/.test(promptJs) && /@media\(max-width:680px\)/.test(promptAssets) && /font-size:16px/.test(promptAssets), "install prompt inline CSS must be mobile-safe and avoid browser zoom");
    assert(/grid-template-areas:var\(--awt-shell-areas\)/.test(idealShell), "shell layout must remain token-driven");
    assert(/scrollbar-gutter:\s*stable/.test(idealChat), "chat scroll surface must reserve scrollbar gutter");
    assert(/chooseTab\(tab\)[\s\S]*closeOpenMenu\(\)/.test(panel), "tab selection must close the menu before rerender");
    assert(/\.right-menu\[open\]/.test(panel), "panel must explicitly find an open right menu");
    assert(!/classList\.toggle\("hidden"\)/.test(index + appMain), "raw hidden sidebar toggle returned");
    assert(/sendPrompt:[\s\S]*controller\.send\(prompt/.test(index), "index automation must send through controller.send");
    assert(count(appMain, /controller\.sendAutomation/g) === 1, "app-main sendAutomation wiring count wrong");
    assert(/registerAwtsmoosBackgroundHandlers/.test(bg), "background must install the split handler module");
    assert(count(bgHandlers, /portManager\.on\("fetch"/g) === 1, "extension fetch handler must be exactly one");
    assert(count(bgHandlers, /"fetch-body"/g) === 1, "extension fetch-body handler must be exactly one");
    assert(count(bgHandlers, /"resume-stream"/g) === 1, "extension resume handler must be exactly one");
    return { imports: imports.length, eventImports: eventImports.length, activeCss: activeCss.length, allCss: allCss.length, activeImportant: 0, eventsManifestLive: true, thoughtsLive: true, toolTerminalLive: true, fileReviewLive: true, mobileOverlapSeal: "final-small", handlers: 3 };
  });
}

function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function count(text, re) { return (text.match(re) || []).length; }
function directImports(text) { return [...text.matchAll(/@import\s+"([^"]+)"(?:\s+layer\([^)]+\))?;/g)].map(m => m[1]); }
function expectedImports() {
  return ["./css/ideal/tokens.css", "./css/ideal/shell.css", "./css/ideal/sidebar.css", "./css/ideal/chat.css", "./css/ideal/composer.css", "./css/ideal/automation.css", "./css/ideal/settings.css", "./css/right-panel/manifest.css", "./css/events/manifest.css", "./css/ideal/mobile.css", "./css/right-panel/mobile-overlap-kill.css"];
}
function expectedEventImports() { return ["./tokens.css", "./region.css", "./panel-chrome.css", "./thought-run.css", "./thought-stepper.css", "./tool-terminal.css", "./file-review.css", "./mobile.css"]; }
function isManifestOnly(styles) {
  return styles.replace(/\/\*[\s\S]*?\*\//g, "").split(/\r?\n/).every(line => {
    const text = line.trim();
    return !text || /^@import\s+"[^"]+";?$/.test(text);
  });
}
function walkCss(dir) {
  return fs.readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name), stat = fs.statSync(full);
    return stat.isDirectory() ? walkCss(full) : full.endsWith(".css") ? [path.relative(ROOT, full)] : [];
  }).sort();
}
function resolveCssImports(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  directImports(read(file)).forEach(importPath => resolveCssImports(path.normalize(path.join(path.dirname(file), importPath)), seen));
  return seen;
}
function balanced(text) { return (text.match(/\{/g) || []).length === (text.match(/\}/g) || []).length; }
function legacyDeny() {
  return ["css/chat.css", "css/event-cockpit.css", "css/stream-resume-hardening.css", "css/thought-freeze-polish.css", "css/thinking-window.css", "css/panel-action-rail.css", "css/panel-controls.css", "css/panel-polish.css", "css/mobile/chat-events.css", "css/mobile/drawer-overlay.css", "css/mobile/panels.css", "css/mobile/shell.css", "css/right-panel/clarity.css", "css/right-panel/spacing.css", "css/right-panel-overlap-kill.css", "css/right-panel-menu.css", "css/automation-futuristic.css", "css/automation-cockpit.css", "css/automation-form-polish.css", "css/automation-status-compact.css"];
}

module.exports = { run };
