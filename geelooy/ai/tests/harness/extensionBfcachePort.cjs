//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  return test("extension-bfcache-port-recovery", async () => {
    const ext = path.join(ROOT, "../scripts/tricks/extensions/server");
    const manifest = JSON.parse(fs.readFileSync(path.join(ext, "manifest.json"), "utf8"));
    const content = fs.readFileSync(path.join(ext, "awtsmoosContent.js"), "utf8");
    const background = fs.readFileSync(path.join(ext, "background.js"), "utf8");
    const engine = fs.readFileSync(path.join(ext, "bgAutomation/engine.js"), "utf8");
    const delegate = fs.readFileSync(path.join(ext, "bgAutomation/pageDelegate.js"), "utf8");

    const permissions = manifest.permissions || [];
    assert(new Set(permissions).size === permissions.length, "manifest permissions must not contain duplicates", { permissions });
    assert(/chrome\.runtime\?\.lastError/.test(content), "content port disconnect must read runtime.lastError to prevent unchecked BFCache errors");
    assert(/chrome\.runtime\?\.lastError/.test(background), "background port disconnect must read runtime.lastError to prevent unchecked BFCache errors");
    assert(/pagehide/.test(content) && /event\.persisted/.test(content), "content bridge must handle BFCache pagehide");
    assert(/pageshow/.test(content) && /server-restoring-bfcache/.test(content), "content bridge must reconnect on BFCache pageshow");
    assert(/visibilitychange/.test(content), "content bridge must reconnect when visible again");
    assert(/disconnectQuietly/.test(content), "content bridge must disconnect before BFCache freezes the message channel");
    assert(/server-port-last-error/.test(content), "content bridge must report consumed port lastError");
    assert(/chrome\.alarms\.create/.test(engine) && /chrome\.storage\.local/.test(fs.readFileSync(path.join(ext, "bgAutomation/storage.js"), "utf8")), "background automation must live in service worker storage/alarms, not page UI");
    assert(/Object\.values\(manager\?\.ports/.test(delegate), "UI broadcast must be best-effort over currently attached ports only");
    assert(!/automation-stream[\s\S]*automation-stream[\s\S]*automation-stream/.test(fs.readFileSync(path.join(ext, "jected.js"), "utf8")), "jected bridge must not duplicate automation-stream dispatch blocks");

    return { permissions: permissions.length, bfcache: true, lastErrorConsumed: true, backgroundIndependent: true };
  });
}

module.exports = { run };
