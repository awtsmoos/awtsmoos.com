//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Modular command orchestrator for Geelooy VFS, native tunnels, real SSH, and virtual-OS access.
 * @description
 * The Awtsmoos gathers many command vessels without collapsing their borders;
 * Awtsmoos.com lets files, native execution, distant SSH, and alias-backed
 * sharing each reveal one ordered chord while Ctrl-C finds its proper rhyme.
 */
import { COMMAND_NAMES, parseCommand } from "./parser.js";
import { createCommandContext } from "./commandContext.js";
import { FileReadCommands } from "./fileReadCommands.js";
import { FileWriteCommands } from "./fileWriteCommands.js";
import { NativeCommands } from "./nativeCommands.js";
import { SshCommands } from "./sshCommands.js";
import { SystemCommands } from "./systemCommands.js";

const HELP = [
	`Commands: ${COMMAND_NAMES.join(", ")}`,
	"SSH terminal: ssh <saved-profile|user@host[:port]>",
	"SSH controls: Ctrl-C / ssh-signal [INT], ssh-close, or ~.",
	"SSH drive: ssh-mount <name> <user@host[:port]> [remoteRoot]",
	"SSH drives: ssh-drives | ssh-unmount <name>",
	"Virtual OS SSH: ssh-share-os <alias> | ssh-revoke-os <alias> | ssh-os-status",
	"Native tunnel commands: sh/exec/native/! only inside a mounted /network/<name>/... cwd."
].join("\n");

export function createCommands(options = {}) {
	const context = createCommandContext(options);
	const ssh = new SshCommands(context);
	const groups = [
		new FileReadCommands(context),
		new FileWriteCommands(context),
		new SystemCommands(context),
		new NativeCommands(context)
	];

	async function run(input = "") {
		const raw = String(input ?? "");
		const parsed = parseCommand(raw);
		if (!parsed.cmd && !ssh.isActive()) {
			return;
		}
		if (raw) {
			context.history.record(raw);
		}
		context.history.push(`${prompt()} ${raw}`);
		try {
			if (await ssh.handle(raw, parsed)) {
				context.render?.();
				return;
			}
			if (parsed.cmd === "help") {
				context.push(HELP);
				context.render?.();
				return;
			}
			const group = groups.find(candidate => candidate.handles(parsed.cmd));
			if (!group) {
				context.push(`unknown command: ${parsed.cmd}`);
				context.render?.();
				return;
			}
			await group.run(parsed.cmd, parsed.args);
		} catch (error) {
			context.push(`error: ${error?.message || error}`);
		}
		context.render?.();
	}

	async function interrupt() {
		try {
			if (!(await ssh.interrupt())) {
				context.push("^C");
			}
		} catch (error) {
			context.push(`error: ${error?.message || error}`);
		}
		context.render?.();
	}

	function complete(value = "") {
		if (ssh.isActive()) {
			return "";
		}
		const last = String(value).split(/\s+/).pop().toLowerCase();
		return COMMAND_NAMES.find(name => name.startsWith(last) && name !== last) || "";
	}

	function prompt() {
		return ssh.isActive() ? `${ssh.prompt()}>` : `${context.state.cwd}>`;
	}

	async function dispose() {
		if (ssh.isActive()) {
			await ssh.close({ silent: true });
		}
	}

	return {
		run,
		interrupt,
		complete,
		dispose,
		help: HELP,
		ssh
	};
}
