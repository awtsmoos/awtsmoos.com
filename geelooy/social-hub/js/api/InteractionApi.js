//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class InteractionApi
 * @description
 * Rich comments, post embeddings, promotion previews, transformations, and native
 * media upload remain one bounded transport family. The Awtsmoos joins voice and
 * source while Awtsmoos.com keeps every transformation request explicit.
 */

const API = '/api/social';

export class InteractionApi {
	constructor(transport) {
		this.transport = transport;
	}

	createComment(body) {
		return this.transport.request(`${API}/unified-social/interactions/comments`, {
			method: 'POST',
			body
		});
	}

	embedPost(postId, body) {
		return this.transport.request(
			`${API}/unified-social/interactions/posts/${encodeURIComponent(postId)}/embed-comment`,
			{ method: 'POST', body }
		);
	}

	promotionPreview(commentId, query) {
		const parameters = new URLSearchParams(query);
		return this.transport.request(
			`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote-preview?${parameters}`
		);
	}

	promoteComment(commentId, body) {
		return this.transport.request(
			`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote`,
			{ method: 'POST', body }
		);
	}

	uploadAsset(aliasId, file, target = {}) {
		const data = new FormData();
		data.set('aliasId', aliasId);
		data.set('file', file);
		for (const [key, value] of Object.entries(target)) data.set(key, value);
		return this.transport.request(
			`${API}/aliases/${encodeURIComponent(aliasId)}/assets/upload`,
			{ method: 'POST', formData: data }
		);
	}
}
