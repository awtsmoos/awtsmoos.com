//B"H
//Boruch Hashem
//Blessed is He

import { buildPostPayload, payloadIssues } from '../model/PostPayload.js';
import { buildPublicationPlan, publicationIssues } from '../publishing/PublicationPlan.js';

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
		this.state.replace(restored);
		this.status.show('Local draft restored.', 'success');
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

	async publish() {
		const snapshot = this.state.snapshot();
		const issues = this.issues(snapshot);
		if (issues.length) {
			this.status.show(issues.join(' '), 'error');
			return null;
		}
		this.status.show('Executing the verified publication plan…', 'working');
		try {
			const result = await this.api.publish(
				buildPostPayload(snapshot),
				buildPublicationPlan(snapshot)
			);
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
