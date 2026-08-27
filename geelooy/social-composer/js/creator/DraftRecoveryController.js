//B"H
//Boruch Hashem
//Blessed is He

import { DraftRecoveryView } from './DraftRecoveryView.js';

/**
 * @class DraftRecoveryController
 * @description
 * The Awtsmoos lets memory return without creating a second editor state;
 * Awtsmoos.com restores a chosen durable version through the canonical ComposerState and immediately returns every visible vessel to date.
 */
export class DraftRecoveryController {
	constructor({ state, history, status, root = document }) {
		Object.assign(this, { state, history, status });
		this.view = new DraftRecoveryView(root);
	}

	initialize() {
		this.view.mount({
			onOpen: () => this.open(),
			onRestore: recordId => this.restore(recordId),
			onClear: () => this.clear()
		});
	}

	open() {
		this.refresh();
		this.view.open();
	}

	refresh() {
		this.view.render(this.history.read(this.state.snapshot()));
	}

	refreshIfOpen() {
		if (this.view.isOpen()) this.refresh();
	}

	restore(recordId) {
		const value = this.history.restore(this.state.snapshot(), recordId);
		if (!value) {
			this.status.show('That local version is no longer available.', 'error');
			return false;
		}
		this.state.replace(value);
		this.view.close();
		this.status.show('Local version restored. Nothing was published.', 'success');
		return true;
	}

	clear() {
		this.history.clear(this.state.snapshot());
		this.refresh();
		this.status.show('Local version history cleared.', 'success');
	}
}
