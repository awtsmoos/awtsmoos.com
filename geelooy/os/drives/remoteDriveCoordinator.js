//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visibility-aware scheduler and cancellation vessel for live remote-drive refreshes.
 * @description
 * The Awtsmoos renews every distant world while Awtsmoos.com lets the browser rest
 * when hidden, aborts abandoned discovery, and delegates each actual refresh deed
 * to its own module so lifecycle remains small, clear, and quietly in rhyme.
 */
import { refreshRemoteDriveWorld } from "./remoteDriveRefresh.js";
import {
	publishRemoteDriveState,
	remoteDriveState
} from "./remoteDriveState.js";

const DEFAULT_INTERVAL_MS = 15_000;

export class RemoteDriveCoordinator {
	constructor(os, intervalMs = DEFAULT_INTERVAL_MS) {
		this.os = os;
		this.intervalMs = intervalMs;
		this.timer = null;
		this.pending = null;
		this.controller = null;
		this.running = false;
		this.state = remoteDriveState("idle", os);
	}

	start() {
		if (this.running) {
			return this;
		}
		this.running = true;
		globalThis.addEventListener?.("focus", this.onFocus);
		globalThis.document?.addEventListener?.("visibilitychange", this.onVisibility);
		this.scheduleNext(0);
		return this;
	}

	stop() {
		this.running = false;
		this.clearTimer();
		this.controller?.abort("remote_drive_coordinator_stopped");
		this.controller = null;
		globalThis.removeEventListener?.("focus", this.onFocus);
		globalThis.document?.removeEventListener?.("visibilitychange", this.onVisibility);
	}

	refresh({ announce = false } = {}) {
		if (this.pending) {
			return this.pending;
		}
		this.controller = new AbortController();
		const signal = this.controller.signal;
		if (announce || this.state.status === "idle") {
			this.state = remoteDriveState("loading", this.os, "", this.state);
			publishRemoteDriveState(this.os, this.state);
		}
		this.pending = refreshRemoteDriveWorld(
			this.os,
			this.state,
			announce,
			signal
		).then(({ result, state }) => {
			this.state = state;
			return result;
		}).finally(() => {
			this.pending = null;
			this.controller = null;
			this.scheduleNext();
		});
		return this.pending;
	}

	scheduleNext(delay = this.intervalMs) {
		this.clearTimer();
		if (!this.running || documentHidden()) {
			return;
		}
		this.timer = globalThis.setTimeout(() => this.refresh(), delay);
	}

	clearTimer() {
		globalThis.clearTimeout(this.timer);
		this.timer = null;
	}

	onFocus = () => {
		if (!documentHidden()) {
			this.refresh();
		}
	};

	onVisibility = () => {
		if (documentHidden()) {
			this.clearTimer();
			return;
		}
		this.refresh();
	};
}

export function installRemoteDriveCoordinator(os, options = {}) {
	if (!os.remoteDriveCoordinator) {
		os.remoteDriveCoordinator = new RemoteDriveCoordinator(
			os,
			options.intervalMs
		).start();
	}
	return os.remoteDriveCoordinator;
}

function documentHidden() {
	return globalThis.document?.visibilityState === "hidden";
}
