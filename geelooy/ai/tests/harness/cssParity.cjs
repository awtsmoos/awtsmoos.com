//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H — Verifies the visible vessels: CSS cascade, entrypoint parity,
 * handlers, and duplicate-prone stream/automation wiring.
 */
async function run() {
  return test("css-and-entrypoint-parity", async () => {
    const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
    const count = (text, re) => (text.match(re) || []).length;
    const styles = read("styles.css");
    const mobileShell = read("css/mobile/shell.css");
    const mobilePanels = read("css/mobile/panels.css");
    const mobileComposer = read("css/mobile/composer.css");
    const chatCss = read("css/chat.css");
    const promptJs = read("prompt.js");
    const imports = [...styles.matchAll(/@import\s+"([^"]+)";/g)].map(m => m[1]);
    const missing = imports.filter(p => !fs.existsSync(path.join(ROOT, p)));
    const cssBalanced = imports.every(p => {
      const text = read(p);
      return count(text, /\{/g) === count(text, /\}/g);
    });
    const index = read("index.js");
    const appMain = read("app-main.js");
    const bg = fs.readFileSync(path.join(ROOT, "../scripts/tricks/extensions/server/background.js"), "utf8");
    assert(styles.split(/\r?\n/).filter(l => l.trim() && !l.startsWith("/*") && !l.startsWith("@import")).length === 0, "styles.css must remain import-only");
    assert(imports.at(-1) === "./css/mobile-vessel.css", "mobile CSS must be last import", { imports });
    assert(imports.includes("./css/boundary-guard.css"), "boundary guard CSS must be imported");
    assert(missing.length === 0, "CSS import missing", { missing });
    assert(cssBalanced, "Imported CSS braces must be balanced");
    assert(/env\(safe-area-inset-top\)/.test(mobileShell), "mobile shell must respect safe-area top inset");
    assert(/grid-template-areas:\s*\"left\" \"main\" \"right\"/.test(mobileShell), "mobile shell must keep both side panels in-flow and reachable");
    assert(/\.sidebar,[\s\S]*\.automation-panel[\s\S]*display:\s*grid\s*!important/.test(mobilePanels), "mobile panels must override desktop display:none collapse");
    assert(/body:not\(\[data-automation-collapsed="true"\]\) \.automation-panel/.test(mobilePanels), "mobile automation panel must be expandable/reachable");
    assert(/env\(safe-area-inset-bottom\)/.test(mobileShell + mobilePanels), "mobile surfaces must respect safe-area bottom inset");
    assert(/#send-button,\s*\n\s*\.attachment-tools button/.test(mobileComposer), "mobile composer controls must share touch target rule");
    assert(/min-height:\s*44px/.test(mobileComposer) && /min-width:\s*44px/.test(mobileComposer), "mobile composer controls must preserve 44px touch targets");
    assert(/@media\(max-width:680px\)/.test(promptJs) && /font-size:16px/.test(promptJs), "install prompt inline CSS must be mobile-safe and avoid browser zoom");
    assert(/@media\(max-width:680px\)/.test(promptJs) && /font-size:16px/.test(promptJs), "install prompt inline CSS must be mobile-safe and avoid browser zoom");
    assert(/overscroll-behavior:\s*contain/.test(chatCss), "chat surfaces must contain overscroll bounce");
    assert(!/classList\.toggle\("hidden"\)/.test(index + appMain), "raw hidden sidebar toggle returned");
    assert(count(index, /controller\.sendAutomation/g) === 1, "index page fallback sendAutomation wiring count wrong");
    assert(!/awtsmoos-background-automation-send/.test(index) && !/backgroundAutomationVisibleDone/.test(index), "page must mirror extension automation state, not continue it");
    const mirror = read("js/automation/backgroundStreamMirror.js");
    assert(/awtsmoos-background-automation-state/.test(mirror) && /controller\.loadConversation/.test(mirror), "open tab must refresh UI from background-owned automation state");
    assert(/awtsmoos-background-automation-stream/.test(mirror) && /StreamRouter/.test(mirror), "open tab must render background-owned automation stream packets live");
    assert(count(appMain, /controller\.sendAutomation/g) === 1, "app-main sendAutomation wiring count wrong");
    assert(count(index, /resumeVisibleStreams\s*=\s*\(\) => resumeStoredStreams/g) === 1, "index resume wiring count wrong");
    assert(count(appMain, /resumeVisibleStreams\s*=\s*\(\) => resumeStoredStreams/g) === 1, "app-main resume wiring count wrong");
    assert(count(bg, /portManager\.on\("fetch"/g) === 1, "extension fetch handler must be exactly one");
    assert(count(bg, /portManager\.on\("fetch-body"/g) === 1, "extension fetch-body handler must be exactly one");
    assert(count(bg, /portManager\.on\("resume-stream"/g) === 1, "extension resume handler must be exactly one");
    return { imports: imports.length, cssBalanced, handlers: 3 };
  });
}

module.exports = { run };
