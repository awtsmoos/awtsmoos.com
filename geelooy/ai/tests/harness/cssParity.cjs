//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H
 * Chapter 287: The Guard Read Every Leaf And Every Gate.
 *
 * The Awtsmoos does not heal a palace by touching one cracked sapphire and
 * ignoring the halls behind it. This verifier walks every CSS scroll under
 * `css/`, resolves the live cascade from `styles.css`, proves the mobile
 * overlap seal is live and last, then checks that the tab chooser closes before
 * a newly rendered room can be covered by yesterday's popover.
 *
 * @returns {Promise<object>} verified cascade and panel facts.
 */
async function run() {
  return test("css-and-entrypoint-parity", async () => {
    const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
    const count = (text, re) => (text.match(re) || []).length;
    const styles = read("styles.css");
    const idealTokens = read("css/ideal/tokens.css");
    const idealShell = read("css/ideal/shell.css");
    const idealChat = read("css/ideal/chat.css");
    const idealComposer = read("css/ideal/composer.css");
    const idealMobile = read("css/ideal/mobile.css");
    const rightManifest = read("css/right-panel/manifest.css");
    const overlapSeal = read("css/right-panel/mobile-overlap-kill.css");
    const panel = read("js/automation/panel.js");
    const promptJs = read("prompt.js");
    const imports = directImports(styles);
    const allCss = walkCss(path.join(ROOT, "css"));
    const activeCss = [...resolveCssImports("styles.css")].filter(file => file.endsWith(".css")).sort();
    const missing = imports.filter(p => !fs.existsSync(path.join(ROOT, p)));
    const unbalancedAll = allCss.filter(file => !balanced(read(file)));
    const index = read("index.js"), appMain = read("app-main.js");
    const bg = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/background.js"), "utf8");

    assert(isManifestOnly(styles), "styles.css must remain a cascade manifest");
    assert(JSON.stringify(imports) === JSON.stringify(expectedImports()), "ideal CSS imports must remain ordered", { imports });
    assert(missing.length === 0, "CSS import missing", { missing });
    assert(unbalancedAll.length === 0, "Every CSS file under geelooy/ai/css must have balanced braces", { unbalancedAll });
    assert(allCss.length >= 80, "CSS forest audit must keep reading every stylesheet", { count: allCss.length });
    assert(activeCss.includes("css/right-panel/mobile-overlap-kill.css"), "mobile overlap seal must be live in the cascade", { activeCss });
    assert(/mobile-overlap-kill\.css";\s*$/m.test(rightManifest), "right-panel mobile overlap seal must remain the final right-panel import");
    assert(/#automation-panel \.right-panel-body[\s\S]*overflow-y:auto!important/.test(overlapSeal), "mobile panel body must own vertical scroll");
    assert(/#automation-panel \.automation-status[\s\S]*position:static!important/.test(overlapSeal), "mobile status pill must not cover controls");
    assert(/#automation-panel \.automation-stop-button[\s\S]*position:static!important/.test(overlapSeal), "mobile stop button must not float over forms");
    assert(/chooseTab\(tab\)[\s\S]*closeOpenMenu\(\)/.test(panel), "tab selection must close the menu before rerender");
    assert(/\.right-menu\[open\]/.test(panel), "panel must explicitly find an open right menu");
    assert(/css\/right-panel\/manifest\.css/.test(styles), "right panel manifest must stay live");
    assert(/mobile\/revamp\.css/.test(idealMobile), "mobile revamp must stay imported");
    assert(/env\(safe-area-inset-top\)/.test(idealTokens + idealMobile), "mobile shell must respect safe-area top inset");
    assert(/position:\s*fixed!important/.test(idealMobile) && /mobile-scene-active/.test(idealMobile), "mobile panels must use reachable scene drawers");
    assert(/mobile-bottom-dock/.test(idealMobile), "mobile dock must be present");
    assert(/env\(safe-area-inset-bottom\)/.test(idealTokens + idealMobile), "mobile surfaces must respect safe-area bottom inset");
    assert(/--awt-send-min:\s*5[6-9]px/.test(idealTokens) && /#send-button\{min-height:var\(--awt-send-min\)/.test(idealComposer), "send button touch target must stay above 44px");
    assert(/@media\(max-width:680px\)/.test(promptJs) && /font-size:16px/.test(promptJs), "install prompt inline CSS must be mobile-safe and avoid browser zoom");
    assert(/grid-template-areas:var\(--awt-shell-areas\)/.test(idealShell), "shell layout must remain token-driven");
    assert(/overscroll-behavior:\s*none/.test(idealTokens), "body must contain mobile overscroll bounce");
    assert(/scrollbar-gutter:\s*stable/.test(idealChat), "chat scroll surface must reserve scrollbar gutter");
    assert(!/classList\.toggle\("hidden"\)/.test(index + appMain), "raw hidden sidebar toggle returned");
    assert(/sendPrompt:[\s\S]*controller\.send\(prompt/.test(index), "index automation must send through controller.send");
    assert(count(appMain, /controller\.sendAutomation/g) === 1, "app-main sendAutomation wiring count wrong");
    assert(count(bg, /portManager\.on\("fetch"/g) === 1, "extension fetch handler must be exactly one");
    assert(count(bg, /portManager\.on\("fetch-body"/g) === 1, "extension fetch-body handler must be exactly one");
    assert(count(bg, /portManager\.on\("resume-stream"/g) === 1, "extension resume handler must be exactly one");
    return { imports: imports.length, activeCss: activeCss.length, allCss: allCss.length, mobileOverlapSeal: true, handlers: 3 };
  });
}

function directImports(text) {
  return [...text.matchAll(/@import\s+"([^"]+)"(?:\s+layer\([^)]+\))?;/g)].map(m => m[1]);
}
function expectedImports() {
  return ["./css/ideal/tokens.css", "./css/ideal/shell.css", "./css/ideal/sidebar.css", "./css/ideal/chat.css", "./css/ideal/composer.css", "./css/ideal/automation.css", "./css/ideal/settings.css", "./css/right-panel/manifest.css", "./css/ideal/mobile.css"];
}
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
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  directImports(text).forEach(importPath => resolveCssImports(path.normalize(path.join(path.dirname(file), importPath)), seen));
  return seen;
}
function balanced(text) {
  return (text.match(/\{/g) || []).length === (text.match(/\}/g) || []).length;
}

module.exports = { run };
