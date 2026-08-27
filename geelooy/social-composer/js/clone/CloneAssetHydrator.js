//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CloneAssetHydrator
 * @description The Awtsmoos lets borrowed media become truly owned whenever the acting alias is revealed anew;
 * Awtsmoos.com carries canonical post proof with every copy, preserves successful vessels, and names remaining resistance true.
 */
import {
	applyOwnedManifest,
	borrowedCloneAttachments,
	cloneAssetKey,
	unresolvedCloneAttachments
} from './CloneAttachmentWalker.js';

export class GevurahCloneAssetHydrator {
	constructor({ state, api, status }) {
		Object.assign(this, { state, api, status });
		this.runningAlias = '';
		this.scheduled = false;
	}

	initialize() {
		this.state.addEventListener('change', event => {
			if (String(event.detail.reason || '').startsWith('clone-assets:')) return;
			this.schedule();
		});
		this.schedule();
	}

	schedule() {
		if (this.scheduled) return;
		this.scheduled = true;
		queueMicrotask(() => {
			this.scheduled = false;
			void this.reconcile();
		});
	}

	async reconcile() {
		const snapshot = this.state.snapshot();
		const cloneSource = snapshot.cloneSource;
		if (!cloneSource?.id) return;
		const aliasId = snapshot.identity.aliasId;
		if (!aliasId) return this.showIdentityNeeded();
		if (this.runningAlias === aliasId) return;
		this.runningAlias = aliasId;
		try {
			const pending = borrowedCloneAttachments(snapshot, aliasId);
			const failures = pending.length
				? await this.copyPending(aliasId, pending, cloneSource)
				: [];
			this.showOutcome(aliasId, failures);
		} finally {
			if (this.runningAlias === aliasId) this.runningAlias = '';
		}
	}

	async copyPending(aliasId, pending, cloneSource) {
		this.status.show(`Copying ${pending.length} media item(s) into @${aliasId}…`, 'loading');
		const unique = new Map();
		const failures = [];
		for (const item of pending) unique.set(cloneAssetKey(item), item.cloneAssetSource);
		for (const [key, source] of unique.entries()) {
			if (this.state.snapshot().identity.aliasId !== aliasId) break;
			try {
				const manifest = await this.api.copy({
					destinationAliasId: aliasId,
					sourceAliasId: source.aliasId,
					sourceAssetId: source.assetId,
					sourceHeichelId: cloneSource.heichelId,
					sourceSeriesId: cloneSource.seriesId || 'root',
					sourcePostId: cloneSource.id
				});
				if (this.state.snapshot().identity.aliasId !== aliasId) break;
				this.state.mutate('clone-assets:owned', value => applyOwnedManifest(value, key, aliasId, manifest));
			} catch (error) {
				failures.push({ key, error });
			}
		}
		return failures;
	}

	showIdentityNeeded() {
		this.status.show('Choose an alias to make copied media independently owned.', 'info');
	}

	showOutcome(aliasId, failures = []) {
		const snapshot = this.state.snapshot();
		const remaining = unresolvedCloneAttachments(snapshot).length
			+ borrowedCloneAttachments(snapshot, aliasId).length;
		if (remaining) {
			const failed = failures.length ? ` ${failures.length} copy operation(s) failed.` : '';
			this.status.show(`${remaining} copied media item(s) still need attention.${failed} Retry or remove them before publishing.`, 'error');
			return;
		}
		this.status.show(`Copied media is now owned by @${aliasId}.`, 'success');
	}
}
