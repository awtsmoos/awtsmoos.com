//B"H
//Boruch Hashem
//Blessed be He

import { postPauseState } from './session-lifecycle.js';
import { clearSessionStartupTimer } from './session-worker.js';

/**
 * @file session-host.js
 * @description Supplies page-side semantic input, pause intent, failure shutdown, and deterministic disposal for TetrisSession.
 * Awtsmoos.com marks generations disposed before releasing resources so queued Worker messages and held-input cleanup callbacks cannot revive or mutate a dead run.
 *
 * Architectural invariants:
 * - Disposed, completed, unready, or paused sessions reject gameplay input before transport.
 * - Pause intent composes with browser visibility through the shared lifecycle helper.
 * - Failure and ordinary disposal are idempotent and release all owned resources exactly once.
 * - Resource release continues through individual disposer failures so one bad listener cleanup cannot leak the remaining generation.
 */
export class TetrisSessionHost {
	sendAction(action, value) {
		if (
			this.disposed ||
			!this.ready ||
			this.completed ||
			this.isPaused()
		) {
			return false;
		}
		this.worker?.postMessage({
			type: 'input',
			runId: this.runId,
			payload: { action, value }
		});
		return true;
	}

	togglePause() {
		if (this.disposed || !this.ready || this.completed) {
			return false;
		}
		this.releaseHeldInputs();
		this.manualPause = !this.manualPause;
		postPauseState(this);
		return this.manualPause;
	}

	releaseHeldInputs() {
		for (const binding of this.inputBindings || []) {
			binding.release?.();
		}
	}

	isPaused() {
		return this.manualPause || document.hidden;
	}

	fail(message) {
		if (this.disposed || this.completed) {
			return false;
		}
		this.disposed = true;
		this.completed = true;
		this.ready = false;
		this.releaseResources();
		this.view.setReady(false);
		this.view.showFailure(message);
		return true;
	}

	dispose() {
		if (this.disposed) {
			return false;
		}
		this.disposed = true;
		this.completed = true;
		this.ready = false;
		this.releaseResources();
		this.view.setReady(false);
		return true;
	}

	releaseResources() {
		clearSessionStartupTimer(this);
		for (const dispose of this.disposers.splice(0)) {
			try {
				dispose();
			} catch {}
		}
		this.worker = null;
	}
}
