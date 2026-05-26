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
    assert(manifest.permissions.includes("alarms"), "background automation needs chrome.alarms permission");
    assert(/bgAutomation\/storage\.js/.test(background) && /bgAutomation\/engine\.js/.test(background), "background must import split automation modules");
    assert(/registerAwtsmoosBackgroundAutomation/.test(background), "background must register automation port handlers");
    assert(/automation-start/.test(fs.readFileSync(path.join(ext, "bgAutomation/api.js"), "utf8")), "automation-start handler must exist");
    assert(/startBackgroundAutomation/.test(jected) && /backgroundAutomationStatus/.test(jected), "page bridge must expose background automation methods");
    assert(/syncBackgroundAutomation/.test(page) && /panel\.getGraph\(\)/.test(page), "page settings must sync graph/settings into extension background");
    return { alarms:true, bridge:true, background:true };
  });
}
module.exports = { run };
