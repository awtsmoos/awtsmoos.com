// B"H

const assert = require("assert");
const Command = require("../tools/command/index.js");
const Aliases = require("../lib/runtime/aliases.js");

assert.equal(typeof Command.ACTIONS.shellCommand, "function");
assert(Command.COMMAND_RUN_ALIASES.includes("shellCommand"));
assert.equal(Aliases.allowed("shellCommand", "commandRun"), true);
assert.equal(Aliases.allowed("shellCommand", "commandStart"), true);
assert.equal(Aliases.allowed("shellCommand", "commandStatus"), false);
const preserved = Command.preserveAliasIdentity({ ok: true, actualAction: "commandRun" }, "shellCommand", "commandRun");
assert.equal(preserved.action, "shellCommand");
assert.equal(preserved.requestAction, "shellCommand");
assert.equal(preserved.actualAction, "shellCommand");
assert.equal(preserved.canonicalAction, "commandRun");
console.log(JSON.stringify({ ok: true, alias: "shellCommand", workers: ["commandRun", "commandStart"] }, null, 2));
