// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps live account tunnels synchronized with Geelooy OS without noisy polling.
 * @description The Awtsmoos renews every connected vessel each instant; Awtsmoos.com refreshes quietly and rerenders only when the living drive-set truly shifts.
 */
const DEFAULT_INTERVAL_MS = 15_000;

export class RemoteDriveCoordinator {
	constructor(os, intervalMs = DEFAULT_INTERVAL_MS) {
		this.os = os;
		this.intervalMs = intervalMs;
		this.timer = null;
		this.pending = null;
		this.state = stateOf("idle");
	}

	start() {
		if (this.timer) {
			return this;
		}
		this.timer = setInterval(() => this.refresh(), this.intervalMs);
		globalThis.addEventListener?.("focus", this.onFocus);
		globalThis.document?.addEventListener?.("visibilitychange", this.onVisibility);
		return this;
	}

	stop() {
		clearInterval(this.timer);
		this.timer = null;
		globalThis.removeEventListener?.("focus", this.onFocus);
		globalThis.document?.removeEventListener?.("visibilitychange", this.onVisibility);
	}

	refresh({ announce = false } = {}) {
		if (this.pending) {
			return this.pending;
		}
		this.state = { ...this.state, status: "loading", lastError: "" };
		this.publish();
		this.pending = this.performRefresh(announce).finally(() => {
			this.pending = null;
		});
		return this.pending;
	}

	performRefresh = async announce => {
		const before = this.driveKey();
		try {
			const result = await this.os.drives.refreshRemote();
			const after = this.driveKey();
			this.os.lastSyncAt = Date.now();
			this.os.updateStatus(result.devices?.ok === false ? "needs-login" : "ready");
			this.os.recordGraphEvent?.("remote.refresh", {
				connected: liveTunnelIds(this.os).length,
				changed: before !== after
			});
			this.state = stateOf("ready", this.os, "");
			this.publish();
			if (before !== after) {
				this.os.renderDesktop?.();
			}
			if (announce) {
				this.os.taskbar?.notify?.(`Connected drives: ${this.state.driveIds.length}`, "success");
			}
			return result;
		} catch (error) {
			this.state = stateOf("error", this.os, error?.message || String(error));
			this.publish();
			return { ok: false, error };
		}
	};

	onFocus = () => this.refresh();

	onVisibility = () => {
		if (globalThis.document?.visibilityState === "visible") {
			this.refresh();
		}
	};

	driveKey() {
		return liveTunnelIds(this.os).sort().join("|");
	}

	publish() {
		this.os.remoteDriveState = Object.freeze({ ...this.state });
		if (typeof CustomEvent === "function") {
			globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:remote-drives", {
				detail: this.os.remoteDriveState
			}));
		}
	}
}

export function installRemoteDriveCoordinator(os, options = {}) {
	if (!os.remoteDriveCoordinator) {
		os.remoteDriveCoordinator = new RemoteDriveCoordinator(os, options.intervalMs).start();
	}
	return os.remoteDriveCoordinator;
}

function stateOf(status, os, lastError = "") {
	return {
		status,
		driveIds: liveTunnelIds(os),
		lastSuccessAt: status === "ready" ? Date.now() : 0,
		lastError
	};
}

function liveTunnelIds(os) {
	return (os?.drives?.list?.() || [])
		.filter(drive => drive.dynamicTunnelDrive === true)
		.map(drive => drive.id);
}
