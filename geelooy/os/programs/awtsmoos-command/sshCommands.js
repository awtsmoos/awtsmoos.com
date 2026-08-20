// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SSH terminal and SSH-drive command group for the Geelooy command program.
 * @description The Awtsmoos lets one prompt cross a real machine boundary while another mount opens its files; Awtsmoos.com keeps secret keys unseen as remote voices rhyme.
 */
import { parseSshTarget } from "../../ssh/profileVault.js";

const LOCAL_NAMES = new Set(["ssh", "ssh-close", "ssh-signal", "ssh-mount", "ssh-unmount", "ssh-drives"]);

export class SshCommands {
	constructor(context) {
		this.context = context;
		this.session = null;
		this.profile = null;
	}

	isActive() {
		return Boolean(this.session && !this.session.closed);
	}

	prompt() {
		if (!this.isActive()) {
			return "";
		}
		return `ssh:${this.profile.username}@${this.profile.host}`;
	}

	async handle(raw = "", parsed = {}) {
		if (this.isActive()) {
			return this.handleRemote(raw, parsed);
		}
		if (!LOCAL_NAMES.has(parsed.cmd)) {
			return false;
		}
		await this.handleLocal(parsed.cmd, parsed.args || []);
		return true;
	}

	async handleRemote(raw, parsed) {
		if (raw.trim() === "~." || parsed.cmd === "ssh-close") {
			await this.close();
			return true;
		}
		if (parsed.cmd === "ssh-signal") {
			await this.session.signal(parsed.args?.[0] || "INT");
			return true;
		}
		await this.session.write(`${raw}\n`);
		return true;
	}

	async handleLocal(command, args) {
		if (command === "ssh") {
			return this.open(args[0]);
		}
		if (command === "ssh-mount") {
			return this.mount(args);
		}
		if (command === "ssh-unmount") {
			return this.unmount(args[0]);
		}
		if (command === "ssh-drives") {
			return this.listDrives();
		}
		if (command === "ssh-close") {
			this.context.push("No SSH terminal session is open.");
			return;
		}
		throw new Error("No SSH terminal session is open.");
	}

	async open(target) {
		if (!target) {
			throw new Error("ssh requires a saved profile name or user@host[:port]");
		}
		const profile = this.resolveProfile(target);
		const secret = this.context.os.ssh.vault.ensureSecret(profile);
		const session = this.context.os.ssh.createTerminalSession({
			onOutput: text => this.onOutput(text),
			onClose: () => this.onClosed(profile)
		});
		await session.open(profile, secret, {
			pty: { term: "xterm-256color", cols: 100, rows: 30 }
		});
		this.session = session;
		this.profile = profile;
		this.context.push(`SSH connected: ${profile.username}@${profile.host}:${profile.port}`);
	}

	resolveProfile(target) {
		const saved = this.context.os.ssh.vault.get(target);
		if (saved) {
			return saved;
		}
		return this.context.os.ssh.vault.save(parseSshTarget(target));
	}

	mount(args) {
		const [name, target, root = "/"] = args;
		if (!name || !target) {
			throw new Error("ssh-mount requires: ssh-mount <name> <user@host[:port]> [remoteRoot]");
		}
		const mounted = this.context.os.ssh.drives.mountTarget(name, target, root);
		this.context.push(`SSH drive mounted: ${mounted.prefix}`);
	}

	unmount(name) {
		if (!name) {
			throw new Error("ssh-unmount requires a profile name");
		}
		this.context.os.ssh.drives.unmount(name);
		this.context.push(`SSH drive removed: ${name}`);
	}

	listDrives() {
		const rows = this.context.os.ssh.drives.list();
		this.context.push(rows.map(item => `${item.name}\t${item.username}@${item.host}:${item.port}\t${item.prefix}\t${item.connected ? "connected" : "needs-credential"}`).join("\n") || "(no SSH drives)");
	}

	onOutput(text) {
		const clean = String(text || "").replace(/\r/g, "");
		if (clean) {
			this.context.push(clean.replace(/\n$/, ""));
			this.context.render?.();
		}
	}

	onClosed(profile) {
		if (this.profile?.name === profile.name) {
			this.session = null;
			this.profile = null;
			this.context.push(`SSH disconnected: ${profile.username}@${profile.host}`);
			this.context.render?.();
		}
	}

	async close() {
		const active = this.session;
		this.session = null;
		this.profile = null;
		await active?.close();
		this.context.push("SSH session closed.");
	}
}
