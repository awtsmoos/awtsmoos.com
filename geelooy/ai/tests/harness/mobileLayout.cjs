//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H
 * Chapter 358: The Mobile Guard Watched Selector Ownership Split Cleanly.
 *
 * The Awtsmoos does not leave the Send button to drown, and does not let the
 * automation palace fold into itself. Revamp is now only the final token seal;
 * composer owns the send gate, scenes own the panels, and events own thoughts.
 *
 * @returns {Promise<object>} facts about verified mobile and stream guards.
 */
async function run() {
  return test("mobile-layout-regression-guard", async () => {
    const styles = read("styles.css");
    const mobile = read("css/ideal/mobile.css");
    const composer = read("css/ideal/mobile/composer.css");
    const suggestions = read("css/ideal/mobile/suggestions.css");
    const revamp = read("css/ideal/mobile/revamp.css");
    const scenes = read("css/ideal/mobile/scenes.css");
    const eventsMobile = read("css/events/mobile.css");
    const eventsRegion = read("css/events/region.css");
    const eventsThought = read("css/events/thought-run.css");
    const overlapSeal = read("css/right-panel/mobile-overlap-kill.css");
    const mobileAutomationFlow = read("css/right-panel/mobile-automation-flow.css");
    const packetState = read("js/app/stream/packetState.js");
    const imports = importsOf(styles), mobileImports = importsOf(mobile);
    const lift = browserLiftPx(revamp);

    assert(imports.includes("./css/right-panel/manifest.css"), "right-panel manifest must be live");
    assert(imports.includes("./css/events/manifest.css"), "thought/tool event palace must be live through its manifest");
    assert(imports.indexOf("./css/right-panel/manifest.css") < imports.indexOf("./css/events/manifest.css"), "event palace should layer above base panels");
    assert(imports.indexOf("./css/events/manifest.css") < imports.indexOf("./css/ideal/mobile.css"), "mobile must polish thought/tool event palace");
    assert(imports.at(-1) === "./css/right-panel/mobile-overlap-kill.css", "automation overlap seal must override mobile bundle");
    assert(mobileImports.at(-1) === "./mobile/revamp.css", "mobile revamp must import last inside mobile bundle");
    assert(lift >= 72, "composer must be lifted above mobile browser toolbars", { lift });
    assert(/#send-button\s*\{[\s\S]*min-height:\s*5[0-9]px/.test(composer), "composer module must own visible thumb-sized send button");
    assert(/\.chat-box\s*\{[\s\S]*scroll-padding-bottom:\s*190px/.test(suggestions), "mobile suggestions module must reserve chat scroll padding for the speech gate");
    assert(/\.main,[\s\S]*\.sidebar,[\s\S]*\.automation-panel/.test(scenes), "scenes module must own mobile panel rooms");
    assert(!/#send-button|\.chat-box|\.main\{|\.sidebar|\.automation-panel/.test(revamp), "mobile revamp must not own concrete selectors");
    assert(!/event-region|thought-envelope-card|tool-window/.test(revamp), "mobile revamp must not own event/thought/tool internals");
    assert(/\.event-region/.test(eventsRegion) && /\.thought-envelope-card/.test(eventsThought), "event modules must own event and thought surfaces");
    assert(/\.transport-details\.is-fullscreen/.test(eventsMobile) && /\.thought-envelope-card\.is-fullscreen/.test(eventsMobile), "event mobile module must own fullscreen event insets");
    assert(/#automation-panel[\s\S]*\.prompt-action-row[\s\S]*grid-template-columns:1fr/.test(mobileAutomationFlow), "prompt action buttons must collapse to one safe mobile column");
    assert(/#automation-panel \.automation-toggle-row[\s\S]*grid-template-columns:minmax\(0,1fr\) auto/.test(mobileAutomationFlow), "toggle rows must keep labels and switches in one non-overlapping row");
    assert(!/!important/.test(overlapSeal), "final mobile overlap guard must not need important declarations");
    assert(/previous\.length < 18\) return false/.test(packetState), "short greetings must not be suppressed as user echoes");
    assert(/shorter \/ longer < 0\.82/.test(packetState), "long echo suppression must require near identity");
    return { imports: imports.length, mobileImports: mobileImports.length, lift, eventsManifestLive: true, overlapSealLast: true, revampOwnsTokensOnly: true };
  });
}

function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function importsOf(text) { return [...text.matchAll(/@import\s+"([^"]+)"/g)].map(match => match[1]); }
function browserLiftPx(text) {
  const match = text.match(/--mobile-browser-lift:\s*calc\((\d+)px/);
  return match ? Number(match[1]) : 0;
}

module.exports = { run };
