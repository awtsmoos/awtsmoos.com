// B"H — Run 07 unit proof for the pure pieces behind the click-level fixes.
import assert from "node:assert/strict";
global.document = { getElementById: () => null, querySelectorAll: () => [] };

const { visibleFieldsFor } = await import("../actionSelection.js");
const list = visibleFieldsFor({ name: "list", defaults: { path: ".", autoPreview: true } });
assert.ok(list.has("actionPath") && list.has("maxChars"), "list shows path + maxChars");
assert.ok(!list.has("websiteMissionPrompt") && !list.has("websiteMissionId"), "list hides website-mission fields");
const doctor = visibleFieldsFor({ name: "browserDoctor", defaults: {} });
assert.deepEqual([...doctor], ["actionName"], "browserDoctor shows no borrowed params");
const web = visibleFieldsFor({ name: "websiteAgentMissionStart", defaults: { needsWebsiteMissionPrompt: true, needsWebsiteMissionId: true } });
assert.ok(web.has("websiteMissionPrompt") && web.has("websiteMissionId"), "website mission keeps its own fields");
assert.ok(!web.has("actionPath"), "website mission does not borrow the file path");

const { sanitizeDiscoveryResponse } = await import("../vessels/discoverySanitizer.js");
const { nativeDevice } = await import("../vessels/test/routeSelectionFixtures.mjs");
const partial = sanitizeDiscoveryResponse({ ok: false, nativeDevices: [nativeDevice()] });
assert.equal(partial.connected, true);
assert.equal(partial.sourceOk, true, "sourceOk must not contradict a delivered connected device");
assert.equal(partial.sourcePartial, true, "partial source failure stays recorded");

const { runtimeStatus } = await import("../../runtime/mesh/runtimeStatus.js");
assert.equal(runtimeStatus({ mode: "virtual-os" }), "online");
assert.equal(runtimeStatus({ mode: "native", tunnel: { connected: true } }), "online");
assert.equal(runtimeStatus({ mode: "native", tunnel: { connected: false } }), "offline");
assert.equal(runtimeStatus({ mode: "native" }), "unknown");
assert.equal(runtimeStatus(null), "unknown");

const { groupRepeatedFailures } = await import("../liveRoom.js");
const outcomes = new Map();
const fail = i => ({ agentId: "agent:asdf", kind: "action", content: "chatgptStatus — pending", at: 1000 + i * 60000, clientMessageId: `m${i}`, detail: { pending: true } });
outcomes.set("m0", { detail: { ok: false, error: "device offline" } });
outcomes.set("m1", { detail: { ok: false, error: "device offline" } });
outcomes.set("m2", { detail: { ok: false, error: "device offline" } });
const okMsg = { agentId: "agent:asdf", kind: "chat", content: "hello", at: 5000, detail: {} };
const rows = groupRepeatedFailures([fail(0), okMsg, fail(1), fail(2)], outcomes);
assert.equal(rows.length, 2, "three identical failures fold into one row");
assert.equal(rows[0].count, 3);
assert.equal(rows[1].message, okMsg, "non-failures untouched");
console.log("B'H run07 unit ok");
