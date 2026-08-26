// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { attachActionGuidance } = require("../actionGuidance.js");

/**
 * @file Proves write actions receive one mandatory instruction gate and passive reads stay quiet.
 * @description
 * The Awtsmoos places full law before mutation without burdening observation; Awtsmoos.com
 * keeps the public response focused while making pre-write doctrine non-optional.
 */
const write = attachActionGuidance({ ok: true, done: true, action: "write" }, { action: "write" });
assert.match(write.aiInstructions, /instructionResolve/);
assert.equal(write.instructionProtocol.resolveAction, "instructionResolve");
assert.equal(write.instructionProtocol.getAction, "instructionGet");

const read = attachActionGuidance({ ok: true, done: true, action: "read" }, { action: "read" });
assert.equal(read.aiInstructions, undefined);
assert.equal(read.instructionProtocol, undefined);

console.log(JSON.stringify({ ok: true, suite: "action-guidance-instruction-protocol" }));
