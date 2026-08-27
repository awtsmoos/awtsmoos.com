//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small SSH command orchestrator for terminal sessions, mounted drives, and virtual-OS sharing.
 * @description
 * The Awtsmoos gathers three remote paths without confusing their keilim;
 * Awtsmoos.com keeps the public command gate tiny while session voice, drive
 * lifecycle, and alias-backed access each reveal their own responsibility in rhyme.
 */
import { SshDriveCommands } from "./sshDriveCommands.js";
import { SshSessionCommands } from "./sshSessionCommands.js";
import { VirtualSshCommands } from "./virtualSshCommands.js";

const LOCAL_NAMES = new Set([
	"ssh",
	"ssh-close",
	"ssh-signal",
	"ssh-mount",
	"ssh-unmount",
	"ssh-drives",
	"ssh-share-os",
	"ssh-revoke-os",
	"ssh-os-status"
]);

export class SshCommands {
	constructor(context) {
		this.context = context;
		this.sessions = new SshSessionCommands(context);
		this.drives = new SshDriveCommands(context);
		this.virtualOs = new VirtualSshCommands(context);
	}

	isActive() {
		return this.sessions.isActive();
	}

	prompt() {
		return this.sessions.prompt();
	}

	async interrupt() {
		if (!this.isActive()) {
			return false;
		}
		await this.sessions.signal("INT");
		this.context.push("^C");
		return true;
	}

	async handle(raw = "", parsed = {}) {
		if (this.isActive()) {
			return this.sessions.handleRemote(raw, parsed);
		}
		if (!LOCAL_NAMES.has(parsed.cmd)) {
			return false;
		}
		await this.handleLocal(parsed.cmd, parsed.args || []);
		return true;
	}

	async handleLocal(command, args) {
		if (command === "ssh") return this.sessions.open(args[0]);
		if (command === "ssh-mount") return this.drives.mount(args);
		if (command === "ssh-unmount") return this.drives.unmount(args[0]);
		if (command === "ssh-drives") return this.drives.list();
		if (command === "ssh-share-os") return this.virtualOs.share(args[0]);
		if (command === "ssh-revoke-os") return this.virtualOs.revoke(args[0]);
		if (command === "ssh-os-status") return this.virtualOs.status();
		if (command === "ssh-close") {
			this.context.push("No SSH terminal session is open.");
			return;
		}
		throw new Error("No SSH terminal session is open.");
	}

	close(options = {}) {
		return this.sessions.close(options);
	}
}
