//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReactionApi
 * @description The Awtsmoos lets one human sign cross old and new reaction routes without confusion;
 * Awtsmoos.com normalizes legacy comment records and privacy-lean entity summaries into one truthful conclusion.
 */

export class YesodReactionApi {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	async summary(target, aliasId = '') {
		const url = new URL(this.endpoint(target), globalThis.location?.origin || 'https://awtsmoos.com');
		if (target.type !== 'comment') url.searchParams.set('heichelId', target.heichelId);
		if (aliasId) url.searchParams.set('aliasId', aliasId);
		return this.request(url.pathname + url.search, { method: 'GET' }, aliasId);
	}

	async set(target, aliasId, emoji) {
		return this.mutate(target, aliasId, { emoji }, 'POST');
	}

	async remove(target, aliasId) {
		return this.mutate(target, aliasId, {}, 'DELETE');
	}

	async mutate(target, aliasId, fields, method) {
		const body = new URLSearchParams({ aliasId, ...fields });
		if (target.type !== 'comment') body.set('heichelId', target.heichelId);
		return this.request(this.endpoint(target), {
			method,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
			body: body.toString()
		}, aliasId);
	}

	endpoint(target) {
		if (target.type === 'comment') {
			return `/api/social/heichelos/${encodeURIComponent(target.heichelId)}/posts/${encodeURIComponent(target.postId)}/comments/${encodeURIComponent(target.id)}/reactions`;
		}
		return `/api/social/reactions/${encodeURIComponent(target.type)}/${encodeURIComponent(target.id)}`;
	}

	async request(url, options, aliasId) {
		const response = await this.fetcher(url, options);
		const result = await response.json().catch(() => null);
		if (!response.ok || result?.error) {
			throw new Error(result?.error?.message || `Reaction request failed with ${response.status}.`);
		}
		return this.normalize(result?.success ?? result, aliasId);
	}

	normalize(value = {}, aliasId = '') {
		const records = Array.isArray(value.records) ? value.records : [];
		const viewerEmoji = value.viewerEmoji || records.find(record => record?.aliasId === aliasId)?.emoji || '';
		return {
			counts: value.counts && typeof value.counts === 'object' ? value.counts : {},
			total: Number(value.total || records.length || 0),
			viewerEmoji
		};
	}
}
