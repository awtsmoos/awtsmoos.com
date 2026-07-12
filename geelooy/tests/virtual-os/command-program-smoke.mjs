// B"H

import assert from "node:assert/strict";
import fs from "node:fs";
import { COMMAND_NAMES, parseCommand } from "../../os/programs/awtsmoos-command/parser.js";

const read = path => fs.readFileSync(path, "utf8");
const basic = read("geelooy/os/basicPrograms.js");
const icons = read("geelooy/os/desktop/icons.js");
const commands = read("geelooy/os/programs/awtsmoos-command/commands.js");
const renderer = read("geelooy/os/programs/awtsmoos-command/renderer.js");

assert(basic.includes("awtsmoosCommand"), "Command program not registered");
assert(icons.includes("Command"), "Command desktop icon missing");

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
