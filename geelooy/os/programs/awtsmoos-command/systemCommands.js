// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file System, provider, history, and desktop command group for the Geelooy terminal.
 * @description The Awtsmoos lets the shell describe its own vessel without pretending to be the vessel; Awtsmoos.com names provider, mount, user, and time in rhyme.
 */
import { providerOfPath } from "./pathTools.js";
import { mountTable, table } from "./format.js";

const NAMES = new Set([
	"clear", "history", "provider", "mounts", "tunnels", "network",
	"refresh", "reload", "connect", "disconnect", "whoami", "hostname",
	"date", "time", "echo", "env", "exit"
]);

export class SystemCommands {
	constructor(context) {
		this.context = context;
	}

	handles(command) {
		return NAMES.has(command);
	}

	async run(command, args = []) {
		if (command === "clear") {
			this.context.history.clear();
			return;
		}
		if (command === "history") {
			const lines = this.context.history.commands().map((value, index) => `${index + 1} ${value}`);
			this.context.push(lines.join("\n") || "(empty)");
			return;
		}
		if (command === "provider") {
			return this.provider(args[0] || this.context.state.cwd);
		}
		if (command === "mounts") {
			this.context.push(mountTable(this.context.vfs().mounts?.() || []));
			return;
		}
		if (command === "tunnels" || command === "network") {
			this.context.push(table(await this.context.vfs().list("/network"), true));
			return;
		}
		if (["refresh", "reload", "connect"].includes(command)) {
			return this.refresh();
		}
		if (command === "disconnect") {
			this.context.push("disconnect: use tunnel control or ssh-unmount for mounted provider vessels.");
			return;
		}
		if (command === "whoami") {
			this.context.push(this.context.os?.aiSession?.userId || "awtsmoos-os-user");
			return;
		}
		if (command === "hostname") {
			this.context.push(globalThis.location?.hostname || "awtsmoos-os");
			return;
		}
		if (command === "date") {
			this.context.push(new Date().toDateString());
			return;
		}
		if (command === "time") {
			this.context.push(new Date().toLocaleTimeString());
			return;
		}
		if (command === "echo") {
			this.context.push(args.join(" "));
			return;
		}
		if (command === "env") {
			return this.env();
		}
		if (command === "exit") {
			this.context.close?.();
		}
	}

	provider(path) {
		const target = this.context.resolve(path);
		const mount = this.context.vfs().resolve?.(target)?.mount || {};
		this.context.push(JSON.stringify({
			path: target,
			provider: providerOfPath(target),
			mount: mount.id,
			capabilities: mount.capabilities || []
		}, null, 2));
	}

	async refresh() {
		const result = await this.context.os?.refreshRemoteDrives?.();
		this.context.push(`refreshed ${(result?.devices?.devices || []).length} provider vessel(s)`);
	}

	env() {
		this.context.push([
			`cwd=${this.context.state.cwd}`,
			`provider=${providerOfPath(this.context.state.cwd)}`,
			`mounts=${(this.context.vfs().mounts?.() || []).length}`,
			"program=awtsmoosCommand"
		].join("\n"));
	}
}
