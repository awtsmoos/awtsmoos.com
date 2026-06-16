// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "awt-preview-store-"));
process.env.__awtsdir = dir;

const store = require("../previewStore.js");
const policy = require("../previewPolicy.js");

let settings = store.settingsGet("user-a");
assert.strictEqual(settings.allowAiManagePreview, true);
assert.strictEqual(settings.allowAiCreatePublic, false);

let denied = store.createPreview("user-a", { createdBy: "ai", kind: "file", path: "report.html", visibility: "public" });
assert.strictEqual(denied.ok, false);
assert.strictEqual(denied.error, "ai_public_preview_disabled");

settings = store.settingsSet("user-a", { allowAiCreatePublic: true, allowAiExposeLocalServers: true });
assert.strictEqual(settings.allowAiCreatePublic, true);
const got = store.createPreview("user-a", { createdBy: "ai", kind: "file", path: "AI_THOUGHTS/report.html", visibility: "public", ttlSeconds: 999999 });
assert.strictEqual(got.ok, true);
assert(got.viewUrl.includes("/view/"));
assert(got.expiresAt - got.createdAt <= settings.maxPublicTtlSeconds * 1000);
assert.strictEqual(store.listPreviews("user-a").length, 1);
const found = store.getPreview("user-a", got.id, { countOpen: true });
assert.strictEqual(found.id, got.id);
assert.strictEqual(store.revokePreview("user-a", got.id).ok, true);
assert.strictEqual(store.getPreview("user-a", got.id), null);
assert.strictEqual(policy.deniesSecretPath("foo/.env", settings), true);
assert.strictEqual(policy.deniesSecretPath("safe/report.md", settings), false);
console.log("BHY preview gateway store tests passed");
