//B"H
//Boruch Hashem
//Blessed is He

import { migrationManifest } from './ManifestBuilder.js';
import { planTranches } from './PlanTranches.js';

/**
 * @class MigrationRunner
 * @description
 * The Awtsmoos reveals capability, preflight, dry plan, consented storage, renewed plan, then publication;
 * Awtsmoos.com delegates media to truthful providers while deterministic checkpoints keep every completed step in view.
 */
export class MigrationRunner {
	constructor({ api, mediaUploader, checkpoint }) {
		Object.assign(this, { api, mediaUploader, checkpoint });
		this.serverCapabilities = null;
	}

	async capabilities() {
		if (!this.serverCapabilities) {
			this.serverCapabilities = await this.api.meta();
		}
		return this.serverCapabilities;
	}

	selectedItems(state) {
		return state.items.filter(item => state.selectedIds.has(item.id));
	}

	async preflight(state) {
		const manifest = migrationManifest(state, this.selectedItems(state));
		return this.api.preflight(manifest);
	}

	async dryPlan(state) {
		const capabilities = await this.capabilities();
		const maxItems = capabilities?.plan?.maxItems || 250;
		const plans = [];
		for (const items of planTranches(this.selectedItems(state), maxItems)) {
			plans.push(await this.api.plan(migrationManifest(state, items)));
		}
		return {
			entries: plans.flatMap(plan => plan.entries || []),
			plans
		};
	}

	async uploadSelectedMedia(state, archive, onProgress = () => {}) {
		const capabilities = await this.capabilities();
		return this.mediaUploader.upload({
			state,
			items: this.selectedItems(state),
			archive,
			capabilities,
			onProgress
		});
	}

	async publish(state, entries, onEntry = () => {}) {
		for (const entry of entries) {
			const key = entry.publicationPlan.idempotencyKey;
			if (state.completed[key]) continue;
			const itemId = `${entry.provider}:${entry.sourceId}`;
			try {
				const result = await this.api.publish(entry);
				state.completed[key] = result?.canonical?.id || entry.sourceId;
				state.failures = state.failures.filter(item => item.key !== key);
				onEntry({ entry, result, ok: true });
			} catch (error) {
				state.failures = state.failures.filter(item => item.key !== key);
				state.failures.push({ key, itemId, sourceId: entry.sourceId, message: error.message });
				onEntry({ entry, error, ok: false });
			}
			this.checkpoint.save(state);
		}
	}
}
