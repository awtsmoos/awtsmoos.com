// B"H

import assert from "node:assert/strict";
import fs from "node:fs";
import { COMMAND_NAMES, parseCommand } from "../../os/programs/awtsmoos-command/parser.js";
import { programs } from "../../os/basicPrograms.js";
import { appById } from "../../os/shell/appCatalog.js";
import { launcherAppGroups } from "../../os/shell/surfacePolicy.js";
import { APP_CATALOG } from "../../os/shell/appCatalog.js";

const read = path => fs.readFileSync(path, "utf8");

const commands = ["commands", "commandContext", "fileWriteCommands", "systemCommands", "nativeCommands"]
  .map(name => read(`geelooy/os/programs/awtsmoos-command/${name}.js`)).join("\n");
const renderer = read("geelooy/os/programs/awtsmoos-command/renderer.js");

// The slim facade no longer repeats the real program registry or desktop catalog.
assert.equal(typeof programs.awtsmoosCommand?.launch, "function", "Command launcher missing");
assert.equal(appById("command")?.programName, "awtsmoosCommand", "Command catalog entry missing");
assert.equal(appById("command")?.title, "Command");
assert(launcherAppGroups(APP_CATALOG).system.some(app => app.id === "command"),
  "Command must remain discoverable in System without crowding the four-item desktop");

const required = [
	"help", "pwd", "ls", "ll", "tree", "cd", "mkdir", "touch", "rm", "mv", "cp",
	"cat", "head", "tail", "grep", "find", "stat", "open", "edit", "history", "clear",
	"exit", "mounts", "tunnels", "connect", "disconnect", "reload", "refresh", "whoami",
	"hostname", "date", "time", "echo", "env", "read", "write", "json", "preview", "search"
];
for (const command of required) assert(COMMAND_NAMES.includes(command), `command missing ${command}`);
assert.deepEqual(parseCommand("write /a.txt hello world"), {
	cmd: "write",
	args: ["/a.txt", "hello", "world"]
});

for (const term of [
	"os?.vfs",
	"vfs().write",
	"mutate(\"mkdir\"",
	"mutate(\"remove\"",
	"vfs()[method]",
	"refreshRemoteDrives",
	"globalThis.location",
	"TunnelClient.fsAction"
]) assert(commands.includes(term), `command safety hook missing ${term}`);

for (const term of ["ArrowUp", "ArrowDown", "ctrlKey", "Tab", "complete?.", "aria-live"]) {
	assert(renderer.includes(term), `renderer interaction missing ${term}`);
}

console.log("B\"H command-program-smoke passed");
