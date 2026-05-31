//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H
 * Chapter 282: The Mobile Guard Learned The Voice Of A Greeting.
 *
 * The Awtsmoos does not leave the Send button to drown, and does not let the
 * word `Hey` murder the answer `Hey! What can I help with?` This guardian now
 * protects the lifted composer, the hidden Settings trace storm, and the softer
 * echo judge that keeps streaming alive.
 *
 * @returns {Promise<object>} facts about the verified mobile and stream guard.
 */
async function run() {
  return test("mobile-layout-regression-guard", async () => {
    const styles = read("styles.css");
    const mobile = read("css/ideal/mobile.css");
    const revamp = read("css/ideal/mobile/revamp.css");
    const packetState = read("js/app/stream/packetState.js");
    const imports = importsOf(styles), mobileImports = importsOf(mobile);
    const lift = browserLiftPx(revamp);

    assert(imports.includes("./css/right-panel/manifest.css"), "right-panel manifest must be live");
    assert(imports.indexOf("./css/right-panel/manifest.css") < imports.indexOf("./css/ideal/mobile.css"), "mobile must override right-panel base styles");
    assert(mobileImports.at(-1) === "./mobile/revamp.css", "mobile revamp must import last");
    assert(lift >= 72, "composer must be lifted above mobile browser toolbars", { lift });
    assert(/#send-button\{display:grid!important;place-items:center!important;min-height:50px!important/.test(revamp), "send button must remain visible and thumb-sized");
    assert(/\.chat-box\{[^}]*var\(--mobile-browser-lift\)/.test(revamp), "chat scroll padding must account for lifted composer");
    assert(/\.event-region,\.thought-envelope-card,\.tool-window,\.bubble,\.audio-offer/.test(revamp), "thinking, writing, tool-call, and audio states must share mobile polish");
    assert(/\.window-controls,\.tool-call-actions,\.event-actions,\.audio-offer-actions/.test(revamp), "tool call action rows must be mobile grids");
    assert(/#automation-panel \.settings-hero-card~\.event-filter-grid\{display:none!important\}/.test(revamp), "Settings must hide trace filter storm on mobile");
    assert(/previous\.length < 18\) return false/.test(packetState), "short greetings must not be suppressed as user echoes");
    assert(/shorter \/ longer < 0\.82/.test(packetState), "long echo suppression must require near identity");
    return { imports: imports.length, mobileImports: mobileImports.length, lift };
  });
}

function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function importsOf(text) { return [...text.matchAll(/@import\s+"([^"]+)"/g)].map(match => match[1]); }
function browserLiftPx(text) {
  const match = text.match(/--mobile-browser-lift:\s*calc\((\d+)px/);
  return match ? Number(match[1]) : 0;
}

module.exports = { run };
