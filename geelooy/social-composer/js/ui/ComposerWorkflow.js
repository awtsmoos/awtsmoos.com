//B"H
//Boruch Hashem
//Blessed is He

import { buildPostPayload, payloadIssues } from '../model/PostPayload.js';
import { buildPublicationPlan, publicationIssues } from '../publishing/PublicationPlan.js';
import { normalizeComposerValue } from '../state/ComposerValue.js';
import { requestId } from '../state/PublicationValue.js';

/**
 * @class ComposerWorkflow
 * @description
 * Local memory, bounded versions, native drafts, verified planning, execution, and safe return become one procession;
 * the Awtsmoos joins intention and deed while Awtsmoos.com distinguishes saved, submitted, partial, reviewed, and published seed.
 */
export class ComposerWorkflow {
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

	issues(snapshot) {
		return [
			...payloadIssues(snapshot),
			...publicationIssues(snapshot)
		].filter((item, index, values) => values.indexOf(item) === index);
	}

	resultMessage(result) {
		if (result.status === 'submitted') return 'Submitted to the Heichel review queue.';
		if (result.status === 'partial') {
			return 'Canonical content published; one or more secondary destinations need attention.';
		}
		return 'Published through the unified social graph.';
	}

	/**
	 * Replaces the just-published state with a fresh post that keeps only
	 * the verified identity, destination, and composer mode — no title,
	 * text, sections, or attachments survive into the next post.
	 */
	resetAfterPublish(snapshot) {
		const fresh = normalizeComposerValue({
			identity: snapshot.identity,
			questionId: snapshot.questionId,
			postKind: snapshot.postKind,
			presentationKind: snapshot.presentationKind
		}, {});
		this.state.replace(fresh);
	}

	/** Mints a fresh publication key so the next attempt is a new deed, never a replay of this one. */
	rotatePublicationKey() {
		this.state.mutate('publication:rotate-key', state => {
			state.publication.idempotencyKey = requestId();
		});
	}

	async publish() {
		const snapshot = this.state.snapshot();
		const issues = this.issues(snapshot);
		if (issues.length) {
			this.status.show(issues.join(' '), 'error');
			return null;
		}
		this.status.show('Executing the verified publication plan…', 'working');
		try {
			let result = null;
			try {
				result = await this.api.publish(
					buildPostPayload(snapshot),
					buildPublicationPlan(snapshot)
				);
			} catch (error) {
				if (error?.code !== 'PUBLICATION_KEY_CONFLICT') throw error;
			}
			if (!result || result?.error?.code === 'PUBLICATION_KEY_CONFLICT') {
				// The draft kept a key an earlier publication already consumed
				// for different content; the server rightly refused to replay
				// that success. Rotate the key and execute once, for real.
				this.rotatePublicationKey();
				const fresh = this.state.snapshot();
				result = await this.api.publish(
					buildPostPayload(fresh),
					buildPublicationPlan(fresh)
				);
			}
			if (result?.error) {
				throw new Error(result.error.message || 'Publication failed.');
			}
			// B"H 2026-11-20 (composer publish cluster, defect 4):
			// publication consumed this draft. Reset the live state to a
			// fresh post BEFORE clearing the saved draft — previously the
			// published title, text, and attachments stayed loaded, and
			// the next autosave pulse (or the pagehide flush) re-saved
			// them as a "new" local draft, so the published post's
			// attachments bled into the next post the composer opened.
			this.resetAfterPublish(snapshot);
			this.localDrafts.clear(snapshot);
			this.draftHistory?.clear(snapshot);
			this.status.show(this.resultMessage(result), 'success');
			this.onPublished?.(result);
			if (this.returnPath) {
				setTimeout(() => window.location.assign(this.returnPath), 450);
			}
			return result;
		} catch (error) {
			this.saveLocal(false);
			this.status.show(`${error.message} Your local draft remains saved.`, 'error');
			return null;
		}
	}
}
