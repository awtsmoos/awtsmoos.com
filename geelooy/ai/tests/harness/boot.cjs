//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H — Boot regression tests for extension-backed ChatGPT loading.
 *
 * The Awtsmoos asks the cockpit to remember its first duty: before automation,
 * before relay experiments, before glittering side quests, the extension bridge
 * must expose a fetch vessel, list conversations, and leave the shell standing
 * when ChatGPT refuses or delays a response.
 */
async function run() {
  const ext = path.join(ROOT, "../scripts/tricks/extensions/server");
  const files = readBootFiles(ext);
  const results = [];
  results.push(await test("extension-bridge-boot-exposes-awtsmoos-fetch", () => {
    assert(/window\.awtsmoosFetch\s*=\s*awtsFetch/.test(files.jected), "jected bridge must expose awtsmoosFetch");
    assert(/window\.mFetch\s*=\s*awtsFetch/.test(files.jected), "jected bridge must expose legacy mFetch");
    assert(/awtsmoos-server-ready/.test(files.jected), "bridge must announce readiness");
    assert(/chrome\.runtime\.getURL\("\.\/jected\.js"\)/.test(files.content), "content script must inject jected.js into page world");
    return { awtsmoosFetch:true, mFetch:true, ready:true };
  }));
  results.push(await test("conversation-list-extension-mock-renders-sidebar-items", () => {
    assert(/response = await this\.controller\.loadConversationListWithRetries/.test(files.pager), "pager must request through controller/service path");
    assert(/Array\.isArray\(response\?\.items\)/.test(files.pager), "pager must accept ChatGPT list item shape");
    assert(/list\.appendChild\(this\.makeConversation\(conversation\)\)/.test(files.pager), "pager must render every returned item");
    assert(/li\.dataset\.id = conversation\.id/.test(files.pager), "sidebar rows must preserve conversation ids");
    return { rendersItems:true };
  }));
  results.push(await test("extension-list-failure-shows-clear-error", () => {
    assert(/Conversation list could not load/.test(files.controller), "list failure must be visible, not blank");
    assert(/this\.renderer\.showError\?\.\("Conversation list error"/.test(files.controller), "list failure must reach shell error renderer");
    assert(/catch \(error\) \{ this\.renderListError\(list, error\); \}/.test(files.controller), "refreshList must catch list errors");
    return { clearError:true };
  }));
  results.push(await test("chatgpt-page-boot-does-not-call-node-relay-unless-enabled", () => {
    assert(/enabled:\s*false/.test(files.relaySettings), "relay default must be disabled");
    assert(/if \(!ignoreEnabled && !isNodeRelayEnabled\(\)\) return false/.test(files.relayFetch), "relay health must be gated by explicit selection");
    assert(/if \(!isNodeRelayEnabled\(\)\) throw new Error\("Node relay is not enabled/.test(files.relayFetch), "relay fetch must refuse implicit use");
    return { relayDefaultOff:true };
  }));
  results.push(await test("automation-bridge-detection-cannot-block-conversation-list", () => {
    const detection = between(files.backgroundBridge, "export function hasBackgroundAutomationBridge", "export async function getBackgroundAutomationStatus");
    assert(!/await|checkNodeRelay|automationBridge\(/.test(detection), "sync bridge detection must not probe relay or await");
    assert(/scheduleIdle\(\(\) => bootAutomation/.test(files.index) && /function bootAutomation[\s\S]*hasBackgroundAutomationBridge\(\)/.test(files.index), "automation bridge detection must be deferred after boot");
    return { nonBlocking:true };
  }));
  results.push(await test("audio-controls-cannot-throw-during-conversation-load", () => {
    assert(/if \(!shell \|\| !conversationId/.test(files.audio), "audio offer must guard missing shells and ids");
    assert(/function mountAudioOfferLazy\(options\) \{\s*mountAwtsmoosAudioOffer\(options\);\s*\}/.test(files.controller), "conversation load must call audio through one guarded leaf");
    assert(/catch \(error\) \{[\s\S]*Conversation load error/.test(files.controller), "conversation load errors must render visibly");
    return { guardedAudio:true };
  }));
  results.push(await test("chatgpt-list-detail-fetch-errors-do-not-kill-app-shell", () => {
    assert(/renderListError\(list, error\)/.test(files.controller), "list fetch errors must stay inside sidebar");
    assert(/this\.renderer\.showError\?\.\("Conversation load error"/.test(files.controller), "detail fetch errors must show in chat shell");
    assert(/Awtsmoos ChatGPT transport is not connected yet/.test(files.bridge), "missing transport must raise a clear app-level message");
    return { shellSurvivesErrors:true };
  }));
  results.push(await test("automation-page-send-is-identical-to-manual-send-path", () => {
    assert(/sendPrompt:[\s\S]*controller\.send\(prompt, \{[\s\S]*ondone/.test(files.index), "automation page sender must call controller.send just like manual send");
    assert(/async sendAutomation[\s\S]*automation:\s*false/.test(files.controller), "hidden automation wrapper must not mark automation in service payload");
    assert(/sendFromText[\s\S]*controller\.send\(prompt, \{/.test(files.index), "manual sender must use controller.send");
    assert(/streamContext:[\s\S]*automation:\s*false/.test(files.controller), "stream context must not mark ChatGPT sends as automation");
    return { sameControllerSend:true, noAutomationPayload:true };
  }));
  results.push(await test("chatgpt-sentinel-proof-is-fresh-per-send", () => {
    assert(!/cachedSentinel|SENTINEL_TTL|cachedSentinelAt/.test(files.requirements), "sentinel proof token must not be cached across sends");
    assert(/Every Send Receives Its Own Seal/.test(files.requirements), "fresh proof invariant must be documented");
    assert(/const requirements = await getChatRequirements\(mFetch\)/.test(files.requirements), "each send must request requirements");
    assert(/const proof = await getEnforcementToken\(requirements\)/.test(files.requirements), "each send must mint a fresh proof");
    return { freshSentinelEverySend:true };
  }));
  results.push(await test("automation-countdown-is-not-cut-by-composer", () => {
    assert(/padding:\s*12px 18px 96px/.test(files.chatCss), "chat box needs bottom room for sticky countdown above composer");
    assert(/\.automation-countdown[\s\S]*min-height:\s*46px/.test(files.chatCss), "countdown must have a full-height vessel");
    assert(/position:\s*sticky/.test(files.chatCss) && /bottom:\s*12px/.test(files.chatCss), "countdown should remain visible above composer");
    assert(/overflow:\s*visible/.test(files.chatCss), "countdown text must not be clipped");
    return { visibleCountdown:true };
  }));
  return { ok: results.every(r => r.ok), name: "chatgpt-extension-boot-regressions", ms: results.reduce((n, r) => n + r.ms, 0), facts: Object.fromEntries(results.map(r => [r.name, r.facts])) };
}

function readBootFiles(ext) {
  return {
    index: read("index.js"), controller: read("js/app/conversationController.js"), pager: read("js/app/conversationListPager.js"), bridge: read("js/chatgpt/transport/bridge.js"), relayFetch: read("js/chatgpt/transport/nodeRelayFetch.js"), relaySettings: read("js/chatgpt/transport/nodeRelaySettings.js"), backgroundBridge: read("js/automation/backgroundBridge.js"), requirements: read("js/chatgpt/sentinel/requirements.js"), chatCss: read("css/chat.css"), audio: read("js/chatgpt/audio/audioControls.js"), jected: fs.readFileSync(path.join(ext, "jected.js"), "utf8"), content: fs.readFileSync(path.join(ext, "awtsmoosContent.js"), "utf8")
  };
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), "utf8"); }
function between(text, start, end) { const s = text.indexOf(start); const e = text.indexOf(end, s + 1); return s >= 0 && e > s ? text.slice(s, e) : ""; }
module.exports = { run };
