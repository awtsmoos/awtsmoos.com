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
    assert(/env\(safe-area-inset-bottom\)/.test(mobileShell + mobilePanels), "mobile surfaces must respect safe-area bottom inset");
    assert(/#send-button,\s*\n\s*\.attachment-tools button/.test(mobileComposer), "mobile composer controls must share touch target rule");
    assert(/min-height:\s*44px/.test(mobileComposer) && /min-width:\s*44px/.test(mobileComposer), "mobile composer controls must preserve 44px touch targets");
    assert(/overscroll-behavior:\s*contain/.test(chatCss), "chat surfaces must contain overscroll bounce");
    assert(!/classList\.toggle\("hidden"\)/.test(index + appMain), "raw hidden sidebar toggle returned");
    assert(count(index, /controller\.sendAutomation/g) === 1, "index sendAutomation wiring count wrong");
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
