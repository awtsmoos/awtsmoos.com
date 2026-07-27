// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Command = require("../tools/command/index.js");
const Aliases = require("../lib/runtime/aliases.js");

/**
	* @file Proves the shell alias keeps caller identity and truthful execution identity.
	* @description The Awtsmoos names both doorway and worker without contradiction.
	*/
assert.equal(typeof Command.ACTIONS.shellCommand, "function");
assert.equal(Command.COMMAND_RUN_ALIASES.includes("shellCommand"), true);
assert.equal(Aliases.allowed("shellCommand", "commandRun"), true);
assert.equal(Aliases.allowed("shellCommand", "commandStart"), true);
assert.equal(Aliases.allowed("shellCommand", "commandStatus"), false);

const preserved = Command.preserveAliasIdentity({
	ok: true,
	executionAction: "commandRun",
	actualAction: "commandRun"
}, "shellCommand", "commandRun");
assert.equal(preserved.action, "shellCommand");
assert.equal(preserved.requestAction, "shellCommand");
assert.equal(preserved.executionAction, "commandRun");
assert.equal(preserved.actualAction, "commandRun");
assert.equal(preserved.canonicalAction, "commandRun");
assert.equal(preserved.actionPromoted, true);
assert.equal(preserved.actionMismatch, false);

console.log(JSON.stringify({
	ok: true,
	alias: "shellCommand",
	callerIdentity: "shellCommand",
	executionIdentity: "commandRun",
	workers: ["commandRun", "commandStart"]
}, null, 2));
