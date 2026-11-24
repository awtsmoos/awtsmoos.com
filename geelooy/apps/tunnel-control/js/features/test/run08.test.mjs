// B"H — Run 08 unit proof: feed folding covers non-failed repeats too.
import assert from "node:assert/strict";
global.document = { getElementById: () => null, querySelectorAll: () => [], querySelector: () => null };

const { groupRepeatedFailures } = await import("../liveRoom.js");

// Identical NON-failed sweep entries (the live websiteAgentMissionList spam)
const okMsg = i => ({ agentId: "agent:asdf", kind: "action", content: "websiteAgentMissionList", at: 1000 + i * 60000, clientMessageId: `ok${i}`, detail: {} });
const single = { agentId: "agent:asdf", kind: "chat", content: "unique hello", at: 9000, detail: {} };
const rows = groupRepeatedFailures([okMsg(0), single, okMsg(1), okMsg(2)], new Map());
assert.equal(rows.length, 2, "three identical non-failed entries fold into one row");
assert.equal(rows[0].count, 3);
assert.equal(rows[0].lastAt, okMsg(2).at, "folded row keeps the last timestamp");
assert.equal(rows[1].message, single, "genuine single entry untouched");

// Failed and ok entries with the same text stay in separate rows.
const failMsg = { agentId: "agent:asdf", kind: "action", content: "chatgptStatus — pending", at: 5000, clientMessageId: "f0", detail: { pending: true } };
const outcomes = new Map([["f0", { detail: { ok: false, error: "device offline" } }]]);
const mixed = groupRepeatedFailures([okMsg(0), failMsg, okMsg(1)], outcomes);
assert.equal(mixed.length, 2, "failed entries never merge into ok rows");
assert.equal(mixed[0].count, 2);
assert.equal(mixed[1].count, 1);

// Distinct content never folds.
const a = { agentId: "agent:asdf", kind: "chat", content: "one", at: 1, detail: {} };
const b = { agentId: "agent:asdf", kind: "chat", content: "two", at: 2, detail: {} };
assert.equal(groupRepeatedFailures([a, b], new Map()).length, 2, "distinct entries stay distinct");
console.log("B'H run08 unit ok");
