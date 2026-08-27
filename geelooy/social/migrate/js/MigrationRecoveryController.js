//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MigrationRecoveryController
 * @description
 * The Awtsmoos lets failures become a retryable path instead of a broken ending;
 * Awtsmoos.com clears only serializable checkpoint evidence and never pretends local Files can persist.
 */
export class MigrationRecoveryController {
	constructor({ root = document, store, checkpoint, status, onRetry }) {
		Object.assign(this, { root, store, checkpoint, status, onRetry });
		root.getElementById('retryFailures').addEventListener('click', () => this.retry());
		root.getElementById('clearCheckpoint').addEventListener('click', () => this.clear());
	}

	retry() {
		const state = this.store.snapshot();
		const itemIds = new Set(state.failures.map(item => item.itemId).filter(Boolean));
		const sourceIds = new Set(state.failures.map(item => item.sourceId).filter(Boolean));
		this.store.mutate('retry:select', current => {
			current.selectedIds = new Set(current.items.filter(item => {
				return itemIds.has(item.id) || sourceIds.has(item.sourceId);
			}).map(item => item.id));
		});
		void this.onRetry();
	}

	clear() {
		this.checkpoint.clear();
		this.store.mutate('checkpoint:clear', state => {
			state.uploadedAssets = {};
			state.completed = {};
			state.failures = [];
		});
		this.status.show('Local migration checkpoint cleared.');
	}

	render(state) {
		this.root.getElementById('retryFailures').disabled = state.failures.length === 0;
	}
}
