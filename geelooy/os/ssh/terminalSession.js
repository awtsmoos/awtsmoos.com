// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser-side controller for one persistent real SSH PTY session.
 * @description The Awtsmoos lets the far shell speak through repeated gentle polls; Awtsmoos.com carries each byte, then closes the channel when the vessel is whole.
 */
const POLL_MS = 180;

export class SshTerminalSession {
	constructor({ api, onOutput = () => {}, onClose = () => {} } = {}) {
		this.api = api;
		this.onOutput = onOutput;
		this.onClose = onClose;
		this.id = null;
		this.profile = null;
		this.closed = true;
		this.pollTimer = null;
	}

	async open(profile, secret, options = {}) {
		if (this.id && !this.closed) {
			await this.close();
		}
		const result = await this.api.openShell(profile, secret, options);
		this.id = result.session?.id;
		if (!this.id) {
			throw new Error("SSH shell did not return a session id.");
		}
		this.profile = profile;
		this.closed = false;
		this.schedulePoll(0);
		return result.session;
	}

	async write(data = "") {
		this.requireOpen();
		return this.api.shellInput(this.id, String(data));
	}

	async resize(size = {}) {
		this.requireOpen();
		return this.api.shellResize(this.id, size);
	}

	async signal(name = "INT") {
		this.requireOpen();
		return this.api.shellSignal(this.id, name);
	}

	async close() {
		if (!this.id || this.closed) {
			return;
		}
		const id = this.id;
		this.closed = true;
		clearTimeout(this.pollTimer);
		this.pollTimer = null;
		await this.api.shellClose(id).catch(() => null);
		this.onClose({ id, profile: this.profile });
	}

	schedulePoll(delay = POLL_MS) {
		clearTimeout(this.pollTimer);
		if (this.closed) {
			return;
		}
		this.pollTimer = setTimeout(() => this.poll(), delay);
	}

	async poll() {
		if (this.closed) {
			return;
		}
		try {
			const result = await this.api.shellOutput(this.id);
			const output = result.output || {};
			if (output.stdout) {
				this.onOutput(output.stdout, "stdout");
			}
			if (output.stderr) {
				this.onOutput(output.stderr, "stderr");
			}
			if (output.closed) {
				this.closed = true;
				this.onClose({ id: this.id, profile: this.profile });
				return;
			}
		} catch (error) {
			this.onOutput(`SSH polling error: ${error.message}\n`, "stderr");
		}
		this.schedulePoll();
	}

	requireOpen() {
		if (!this.id || this.closed) {
			throw new Error("No SSH terminal session is open.");
		}
	}
}
