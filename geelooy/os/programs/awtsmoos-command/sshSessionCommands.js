//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Living outbound SSH terminal-session commands for Geelooy's command program.
 * @description
 * The Awtsmoos lets one browser prompt cross into a real distant machine while
 * Awtsmoos.com remembers an ad-hoc doorway only after the handshake succeeds;
 * failed targets leave no fossil profile, and living remote voice stays in rhyme.
 */
import { parseSshTarget } from "../../ssh/profileVault.js";

export class SshSessionCommands {
	constructor(context) {
		this.context = context;
		this.session = null;
		this.profile = null;
	}

	isActive() {
		return Boolean(this.session && !this.session.closed);
	}

	prompt() {
		return this.isActive()
			? `ssh:${this.profile.username}@${this.profile.host}`
			: "";
	}

	async handleRemote(raw, parsed = {}) {
		if (raw.trim() === "~." || parsed.cmd === "ssh-close") {
			await this.close();
			return true;
		}
		if (parsed.cmd === "ssh-signal") {
			await this.signal(parsed.args?.[0] || "INT");
			return true;
		}
		await this.session.write(`${raw}\n`);
		return true;
	}

	async open(target) {
		if (!target) {
			throw new Error("ssh requires a saved profile name or user@host[:port]");
		}
		const resolved = this.resolveProfile(target);
		const secret = this.context.os.ssh.vault.ensureSecret(resolved.profile);
		const session = this.context.os.ssh.createTerminalSession({
			onOutput: text => this.onOutput(text),
			onClose: () => this.onClosed(this.profile || resolved.profile)
		});
		await session.open(resolved.profile, secret, {
			pty: { term: "xterm-256color", cols: 100, rows: 30 }
		});
		const profile = resolved.saved
			? resolved.profile
			: this.context.os.ssh.vault.save(resolved.profile);
		this.session = session;
		this.profile = profile;
		this.context.push(`SSH connected: ${profile.username}@${profile.host}:${profile.port}`);
	}

	resolveProfile(target) {
		const saved = this.context.os.ssh.vault.get(target);
		return saved
			? { profile: saved, saved: true }
			: { profile: parseSshTarget(target), saved: false };
	}

	async signal(signal = "INT") {
		if (!this.isActive()) {
			return false;
		}
		await this.session.signal(signal);
		return true;
	}

	onOutput(text) {
		const clean = String(text || "").replace(/\r/g, "");
		if (!clean) {
			return;
		}
		this.context.push(clean.replace(/\n$/, ""));
		this.context.render?.();
	}

	onClosed(profile) {
		if (this.profile?.name !== profile.name) {
			return;
		}
		this.session = null;
		this.profile = null;
		this.context.push(`SSH disconnected: ${profile.username}@${profile.host}`);
		this.context.render?.();
	}

	async close(options = {}) {
		const active = this.session;
		this.session = null;
		this.profile = null;
		await active?.close();
		if (!options.silent) {
			this.context.push("SSH session closed.");
		}
	}
}
