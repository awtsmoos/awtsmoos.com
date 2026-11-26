//B"H
//Boruch Hashem
//Blessed is He
/** Draft memory keeps the creator’s intention intact; Awtsmoos.com restores that vessel without borrowing another identity. */
export class ComposerDraftWorkflow {
	constructor(options) {
		Object.assign(this, options);
	}

	restoreLocal() {
		const restored = this.localDrafts.load(this.state.snapshot());
		if (!restored) return false;
		this.preRestoreSnapshot = this.state.snapshot();
		this.restoredDraftAliasId = restored?.identity?.aliasId || '';
		this.draftWasRestored = true;
		// B"H 2026-11-20 (composer publish cluster, defect 1): a saved
		// draft may restore content and destination, never authorship.
		// The durable snapshot carries the identity it was saved under —
		// including a stale userId-as-alias left by an earlier session —
		// and the alias panel then treated that value as the preferred
		// identity, so posts published under it while the composer
		// showed the account's chosen public alias. The posting alias
		// belongs to the verified panel alone: keep the session's
		// starting identity and let the panel confirm or replace it
		// visibly. restoredDraftAliasId above still records the draft's
		// own alias so discardForeignDraft can drop another account's
		// draft exactly as before.
		if (restored.identity) {
			restored.identity.aliasId = this.preRestoreSnapshot.identity?.aliasId || '';
			restored.identity.aliasName = this.preRestoreSnapshot.identity?.aliasName || '';
		}
		this.state.replace(restored);
		this.status.show('Local draft restored.', 'success');
		return true;
	}

	/** Discards a locally restored draft saved under a different account. */
	discardForeignDraft(identity) {
		if (!this.draftWasRestored || !this.restoredDraftAliasId) return false;
		if (!identity?.loggedIn) return false;
		const verified = new Set((identity.aliases || []).map(a => a?.aliasId).filter(Boolean));
		if (verified.has(this.restoredDraftAliasId)) {
			this.draftWasRestored = false;
			this.restoredDraftAliasId = '';
			return false;
		}
		try { this.localDrafts.clear(this.state.snapshot()); } catch {}
		if (this.preRestoreSnapshot) this.state.replace(this.preRestoreSnapshot);
		this.draftWasRestored = false;
		this.restoredDraftAliasId = '';
		this.preRestoreSnapshot = null;
		this.status.show('Discarded a draft saved under a different account. Starting fresh.', 'error');
		return true;
	}

	saveLocal(announce = true) {
		const snapshot = this.state.snapshot();
		const saved = this.localDrafts.save(snapshot);
		if (saved) this.draftHistory?.save(snapshot);
		if (announce) {
			this.status.show(
				saved ? 'Draft and local version saved.' : 'Local draft could not be saved.',
				saved ? 'success' : 'error'
			);
		}
		return saved;
	}

	async saveServer() {
		const snapshot = this.state.snapshot();
		if (!snapshot.identity.aliasId || !snapshot.identity.heichelId) {
			this.status.show('Choose an alias and canonical Heichel before saving.', 'error');
			return null;
		}
		this.status.show('Saving native Geelooy draft…', 'working');
		try {
			const result = await this.api.saveServerDraft(snapshot);
			this.state.mutate('draft:server', state => {
				state.draftId = result.id || result.draftId || state.draftId;
			});
			this.status.show('Draft saved to Geelooy.', 'success');
			return result;
		} catch (error) {
			this.status.show(error.message, 'error');
			return null;
		}
	}

}
