//B"H
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("geelooy/ai");
const EXT = path.join(ROOT, "../scripts/tricks/extensions/server");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const readExt = file => fs.readFileSync(path.join(EXT, file), "utf8");
const manifest = JSON.parse(readExt("manifest.json"));
const files = {
  background: readExt("background.js"),
  jected: readExt("jected.js"),
  page: read("index.js"),
  api: readExt("bgAutomation/api.js"),
  engine: readExt("bgAutomation/engine.js"),
  delegate: readExt("bgAutomation/pageDelegate.js"),
  chatgpt: readExt("bgAutomation/chatgpt.js"),
  bridge: read("js/automation/backgroundBridge.js"),
  panel: read("js/automation/panel.js")
};
const checks = [
  ["alarms", manifest.permissions.includes("alarms")],
  ["pageDelegate import", /bgAutomation\/pageDelegate\.js/.test(files.background)],
  ["register automation", /registerAwtsmoosBackgroundAutomation/.test(files.background)],
  ["awake heartbeat", /Awtsmoos background awake/.test(files.background) && /background-awake/.test(files.background)],
  ["no globalThis.globalThis", !/globalThis\.globalThis/.test(files.background)],
  ["api handlers", /automation-start/.test(files.api) && /automation-status/.test(files.api)],
  ["no visible done", !/automation-visible-done/.test(files.api + files.jected + files.page)],
  ["jected controls", /startBackgroundAutomation/.test(files.jected) && /backgroundAutomationStatus/.test(files.jected)],
  ["state relay", /automation-state/.test(files.jected) && /awtsmoos-background-automation-state/.test(files.jected)],
  ["stream relay", /automation-stream/.test(files.jected) && /awtsmoos-background-automation-stream/.test(files.jected)],
  ["engine owns stream", /sendChatGptBackground/.test(files.engine) && /onPacket/.test(files.engine)],
  ["broadcast", /broadcastAutomationState/.test(files.engine) && /broadcastAutomationStream/.test(files.delegate)],
  ["mirror mount", /mountBackgroundAutomationMirror/.test(files.page)],
  ["no page steal", !/shouldUsePageSender/.test(files.bridge)],
  ["background owned true", /backgroundOwned:true/.test(files.bridge)],
  ["no page resume", /!hasBackgroundAutomationBridge\(\)\) pipeline\.resumeActiveRuns/.test(files.page)],
  ["normalize settings", /normalizeSettings/.test(files.bridge)],
  ["schedule next", /scheduleNext/.test(files.engine) && /setTimeout\(\(\) => tickAutomation\("timer"\)/.test(files.engine)],
  ["recheck enabled", /latest = await store\.loadAutomationState\(\)/.test(files.engine) && /!latest\.enabled/.test(files.engine)],
  ["settled sender", /waitForSettledAssistant/.test(files.chatgpt) && /current_node/.test(files.chatgpt)],
  ["stop panel", /data-auto-action=\"stop\"/.test(files.panel) && /bindAutomationActions/.test(files.panel)]
];
console.log(JSON.stringify(checks.map(([name, ok]) => ({ name, ok })), null, 2));
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) throw new Error(`failed: ${failed.map(([name]) => name).join(", ")}`);
