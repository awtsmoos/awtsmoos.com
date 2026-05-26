//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  return test("extension-background-automation-wiring", async () => {
    const ext = path.join(ROOT, "../scripts/tricks/extensions/server");
    const manifest = JSON.parse(fs.readFileSync(path.join(ext, "manifest.json"), "utf8"));
    const background = fs.readFileSync(path.join(ext, "background.js"), "utf8");
    const jected = fs.readFileSync(path.join(ext, "jected.js"), "utf8");
    const page = fs.readFileSync(path.join(ROOT, "index.js"), "utf8");
    const api = fs.readFileSync(path.join(ext, "bgAutomation/api.js"), "utf8");
    const engine = fs.readFileSync(path.join(ext, "bgAutomation/engine.js"), "utf8");
    const delegate = fs.readFileSync(path.join(ext, "bgAutomation/pageDelegate.js"), "utf8");
    const chatgpt = fs.readFileSync(path.join(ext, "bgAutomation/chatgpt.js"), "utf8");
    const panel = fs.readFileSync(path.join(ROOT, "js/automation/panel.js"), "utf8");
    assert(manifest.permissions.includes("alarms"), "background automation needs chrome.alarms permission");
    assert(/bgAutomation\/pageDelegate\.js/.test(background), "background must import state broadcast module");
    assert(/registerAwtsmoosBackgroundAutomation/.test(background), "background must register automation port handlers");
    assert(!/globalThis\.globalThis/.test(background), "background registration must not use broken globalThis.globalThis path");
    assert(/automation-start/.test(api) && /automation-status/.test(api), "automation start/status handlers must exist");
    assert(!/automation-visible-done/.test(api + jected + page), "page must never tell extension to continue automation");
    assert(/startBackgroundAutomation/.test(jected) && /backgroundAutomationStatus/.test(jected), "page bridge must expose background automation controls");
    assert(/automation-state/.test(jected) && /awtsmoos-background-automation-state/.test(jected), "extension must relay background automation state to open pages");
    assert(/automation-stream/.test(jected) && /awtsmoos-background-automation-stream/.test(jected), "extension must relay ordered automation stream packets to open pages");
    assert(/sendChatGptBackground/.test(engine) && /onPacket/.test(engine), "background engine must own the ChatGPT streaming call and packet callback");
    assert(/broadcastAutomationState/.test(engine) && /broadcastAutomationStream/.test(delegate), "background must broadcast state and stream packets for UI mirroring");
    assert(/mountBackgroundAutomationMirror/.test(page), "open /ai tab must mount live background stream mirror");
    assert(/owner\?\.owner === "page"/.test(page), "page pipeline must run only as fallback owner");
    assert(/!hasBackgroundAutomationBridge\(\)\) pipeline\.resumeActiveRuns/.test(page), "page must not resume local automation when extension bridge exists");
    assert(/normalizeSettings/.test(fs.readFileSync(path.join(ROOT, "js/automation/backgroundBridge.js"), "utf8")), "background bridge must normalize real UI settings before sending to extension");
    assert(/scheduleNext/.test(engine) && /setTimeout\(\(\) => tickAutomation\("timer"\)/.test(engine), "background automation must chain timer ticks in addition to alarms");
    assert(/latest = await store\.loadAutomationState\(\)/.test(engine) && /!latest\.enabled/.test(engine), "background must re-check enabled after a stream before scheduling next turn");
    assert(/waitForSettledAssistant/.test(chatgpt) && /current_node/.test(chatgpt), "background sender must wait for settled final assistant message after custom GPT/tool events");
    assert(/data-auto-action=\"stop\"/.test(panel) && /bindAutomationActions/.test(panel), "automation panel must expose a stop button while streaming");
    return { alarms:true, bridge:true, backgroundOwnsStreaming:true, pageMirrorsOnly:true, stop:true, settled:true };
  });
}
module.exports = { run };
