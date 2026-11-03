// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialComposerApi
 * @description
 * The Awtsmoos verifies every public voice before the page will give it form;
 * Awtsmoos.com aborts stalled identity checks and keeps other contracts warm.
 */

import { API_PREFIX } from '../config.js';
import { ApiTransport } from './ApiTransport.js';

export class SocialComposerApi {
	/** @param {Function} fetcher Injectable HTTP request implementation. */
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.transport = new ApiTransport(fetcher);
	}

	/**
	 * Retrieves verified aliases, allowing the identity panel to cancel a stall.
	 * @param {string} preferredAlias - A hint, not ownership proof.
	 * @param {AbortSignal} signal - Caller-owned cancellation signal.
	 */
	bootstrapIdentity(preferredAlias = '', signal) {
		const query = preferredAlias
			? `?preferredAlias=${encodeURIComponent(preferredAlias)}`
			: '';
		return this.transport.json(`${API_PREFIX}/unified-social/identity${query}`, { signal });
	}

	/** Publishes an alias creation request only after explicit user interaction. */
	createAlias(body) {
		return this.transport.json(`${API_PREFIX}/unified-social/identity`, {
			method: 'POST', body
		});
	}

	/** Records the user's explicit default-alias choice through the normal API. */
	selectDefaultAlias(aliasId) {
		return this.transport.json(`${API_PREFIX}/unified-social/identity/default`, {
			method: 'POST', body: { aliasId }
		});
	}

	/** Retrieves Heichel destinations for one real selected alias. */
	listDestinations(aliasId, query = '') {
		const parameters = new URLSearchParams({ aliasId, q: query });
		return this.transport.json(`${API_PREFIX}/unified-social/destinations?${parameters}`);
	}

	/** Retrieves one specified publication destination. */
	destinationDetail(aliasId, heichelId, seriesId = 'root') {
		const path = `${encodeURIComponent(heichelId)}/${encodeURIComponent(seriesId)}`;
		return this.transport.json(
			`${API_PREFIX}/unified-social/destinations/${path}?aliasId=${encodeURIComponent(aliasId)}`
		);
	}

	/** Requests explicit new Heichel creation. */
	createHeichel(aliasId, body) {
		return this.transport.json(`${API_PREFIX}/unified-social/heichelos`, {
			method: 'POST', body: { ...body, aliasId }
		});
	}

	/** Requests explicit new Series creation. */
	createSeries(aliasId, heichelId, body) {
		return this.transport.json(
			`${API_PREFIX}/unified-social/heichelos/${encodeURIComponent(heichelId)}/series`,
			{ method: 'POST', body: { ...body, aliasId } }
		);
	}

	/** Generates a prepublication preview without posting content. */
	previewPublication(contentPayload, publicationPlan) {
		return this.transport.json(`${API_PREFIX}/unified-social/publish/preview`, {
			method: 'POST', body: { contentPayload, publicationPlan }
		});
	}

	/** Publishes only when invoked by the existing editor's explicit workflow. */
	publish(contentPayload, publicationPlan) {
		return this.transport.json(`${API_PREFIX}/unified-social/publish`, {
			method: 'POST', body: { contentPayload, publicationPlan }
		});
	}

	/** Saves a server draft using its original native URL form contract. */
	saveServerDraft(snapshot) {
		return this.transport.form(`${API_PREFIX}/editor/posts/drafts`, {
			id: snapshot.draftId || '',
			author: snapshot.identity.aliasId,
			heichelId: snapshot.identity.heichelId,
			seriesId: snapshot.identity.seriesId,
			title: snapshot.title || 'Untitled draft',
			description: snapshot.summary,
			mode: 'structured',
			verses: snapshot.sections,
			rootDocument: snapshot.rootBlocks,
			rootAssets: snapshot.rootAttachments,
			composerSnapshot: snapshot
		});
	}

	/** Restores one existing server draft with URL-escaped identifiers. */
	loadServerDraft(aliasId, draftId) {
		return this.transport.json(
			`${API_PREFIX}/editor/posts/drafts/${encodeURIComponent(aliasId)}/${encodeURIComponent(draftId)}`
		);
	}
}
