//B"H
//Boruch Hashem
//Blessed is He

import { DraftRecoveryController } from './creator/DraftRecoveryController.js';
import { DraftAutosave } from './state/DraftAutosave.js';
import { DraftHistoryRepository } from './state/DraftHistoryRepository.js';
import { DraftLeaveGuard } from './state/DraftLeaveGuard.js';

/**
 * @class DraftAssembly
 * @description
 * The Awtsmoos binds quiet autosave, bounded history, restoration, and pending-file protection without burdening the editor controller;
 * Awtsmoos.com lets memory remain one small service whose truth is durable, recoverable, and never mistaken for publication.
 */
export class DraftAssembly {
	constructor({ state, localDrafts, status }) {
		Object.assign(this, { state, localDrafts, status });
		this.history = new DraftHistoryRepository();
		this.guard = new DraftLeaveGuard(state);
		this.recovery = new DraftRecoveryController({
			state,
			history: this.history,
			status
		});
		this.autosave = new DraftAutosave({
			state,
			localDrafts,
			history: this.history,
			onSaved: detail => this.saved(detail)
		});
	}

	initialize() {
		this.recovery.initialize();
		this.autosave.initialize();
		this.guard.initialize();
	}

	saved({ saved }) {
		const status = document.getElementById('draftStatusText');
		if (saved && status && !status.dataset.autosaveReady) {
			status.dataset.autosaveReady = 'true';
			status.textContent = 'Autosaved locally · version recovery available.';
		}
		this.recovery.refreshIfOpen();
	}

	clear() {
		const snapshot = this.state.snapshot();
		const current = this.localDrafts.clear(snapshot);
		const history = this.history.clear(snapshot);
		this.recovery.refreshIfOpen();
		return current && history;
	}
}

export function createDraftAssembly(options) {
	return new DraftAssembly(options);
}
