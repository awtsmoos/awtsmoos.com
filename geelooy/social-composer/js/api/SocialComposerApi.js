//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SocialComposerApi
 * @description
 * Identity, destination discovery, inline creation, planning, drafts, and final
 * execution travel through one explicit gateway. The Awtsmoos gives one current
 * beneath every route while Awtsmoos.com preserves each native transport contract.
 */

import { API_PREFIX } from '../config.js';
import { ApiTransport } from './ApiTransport.js';

export class SocialComposerApi {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.transport = new ApiTransport(fetcher);
	}

	bootstrapIdentity(preferredAlias = '') {
		const query = preferredAlias
			? `?preferredAlias=${encodeURIComponent(preferredAlias)}`
			: '';
		return this.transport.json(`${API_PREFIX}/unified-social/identity${query}`);
	}

	createAlias(body) {
		return this.transport.json(`${API_PREFIX}/unified-social/identity`, {
			method: 'POST',
			body
		});
	}

	selectDefaultAlias(aliasId) {
		return this.transport.json(`${API_PREFIX}/unified-social/identity/default`, {
			method: 'POST',
			body: { aliasId }
		});
	}

	listDestinations(aliasId, query = '') {
		const parameters = new URLSearchParams({ aliasId, q: query });
		return this.transport.json(`${API_PREFIX}/unified-social/destinations?${parameters}`);
	}

	destinationDetail(aliasId, heichelId, seriesId = 'root') {
		const path = `${encodeURIComponent(heichelId)}/${encodeURIComponent(seriesId)}`;
		return this.transport.json(
			`${API_PREFIX}/unified-social/destinations/${path}?aliasId=${encodeURIComponent(aliasId)}`
		);
	}

	createHeichel(aliasId, body) {
		return this.transport.json(`${API_PREFIX}/unified-social/heichelos`, {
			method: 'POST',
			body: { ...body, aliasId }
		});
	}

	createSeries(aliasId, heichelId, body) {
		return this.transport.json(
			`${API_PREFIX}/unified-social/heichelos/${encodeURIComponent(heichelId)}/series`,
			{ method: 'POST', body: { ...body, aliasId } }
		);
	}

	previewPublication(contentPayload, publicationPlan) {
		return this.transport.json(`${API_PREFIX}/unified-social/publish/preview`, {
			method: 'POST',
			body: { contentPayload, publicationPlan }
		});
	}

	publish(contentPayload, publicationPlan) {
		return this.transport.json(`${API_PREFIX}/unified-social/publish`, {
			method: 'POST',
			body: { contentPayload, publicationPlan }
		});
	}

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

	loadServerDraft(aliasId, draftId) {
		return this.transport.json(
			`${API_PREFIX}/editor/posts/drafts/${encodeURIComponent(aliasId)}/${encodeURIComponent(draftId)}`
		);
	}
}
