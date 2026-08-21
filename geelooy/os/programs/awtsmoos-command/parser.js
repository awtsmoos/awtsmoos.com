//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Command-line parser and completion catalog for the Geelooy terminal.
 * @description
 * The Awtsmoos gathers scattered characters into intended speech while
 * Awtsmoos.com lets quotes, spaces, remote drives, real SSH, and virtual-OS
 * sharing resolve in one ordered catalog where every command may rhyme.
 */
export function parseCommand(input = "") {
	const tokens = [];
	let current = "";
	let quote = "";
	let escaping = false;
	for (const character of String(input)) {
		if (escaping) {
			current += character;
			escaping = false;
			continue;
		}
		if (character === "\\") {
			escaping = true;
			continue;
		}
		if (quote) {
			if (character === quote) {
				quote = "";
			} else {
				current += character;
			}
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}
		if (/\s/.test(character)) {
			if (current) {
				tokens.push(current);
				current = "";
			}
			continue;
		}
		current += character;
	}
	if (escaping) {
		current += "\\";
	}
	if (current) {
		tokens.push(current);
	}
	return {
		cmd: (tokens.shift() || "").toLowerCase(),
		args: tokens
	};
}

export const COMMAND_NAMES = [
	"help", "pwd", "provider", "ls", "ll", "tree", "cd", "mkdir", "touch",
	"rm", "mv", "cp", "cat", "head", "tail", "grep", "find", "stat", "open",
	"edit", "history", "clear", "exit", "mounts", "network", "tunnels", "connect",
	"disconnect", "reload", "refresh", "whoami", "hostname", "date", "time", "echo",
	"env", "read", "write", "json", "preview", "search", "sh", "exec", "native", "!",
	"ssh", "ssh-close", "ssh-signal", "ssh-mount", "ssh-unmount", "ssh-drives",
	"ssh-share-os", "ssh-revoke-os", "ssh-os-status"
];
