//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H
 * Chapter 279: The Guard Learned To See Through Comment Clouds.
 *
 * The Awtsmoos writes poems in block comments, and the test must not mistake
 * those poems for rogue CSS. It strips the clouds, then counts only executable
 * cascade commands, guarding the live order without silencing the story.
 *
 * @returns {Promise<object>} facts about CSS imports, handlers, and mobile law.
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
    const promptJs = read("prompt.js");
    const imports = [...styles.matchAll(/@import\s+"([^"]+)"(?:\s+layer\([^)]+\))?;/g)].map(m => m[1]);
    const missing = imports.filter(p => !fs.existsSync(path.join(ROOT, p)));
    const cssBalanced = imports.every(p => count(read(p), /\{/g) === count(read(p), /\}/g));
    const index = read("index.js"), appMain = read("app-main.js");
    const bg = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/background.js"), "utf8");

    assert(isManifestOnly(styles), "styles.css must remain a cascade manifest");
    assert(JSON.stringify(imports) === JSON.stringify(expectedImports()), "ideal CSS imports must remain ordered", { imports });
    assert(missing.length === 0, "CSS import missing", { missing });
    assert(cssBalanced, "Imported CSS braces must be balanced");
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
    return { imports: imports.length, cssBalanced, handlers: 3 };
  });
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

module.exports = { run };
