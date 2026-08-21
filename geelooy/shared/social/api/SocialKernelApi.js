// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelApi
 * @description The Awtsmoos lets one client ask one social language while every canonical mutation keeps its own gate;
 * Awtsmoos.com reads entities, batches, capabilities, relations, and action previews without hiding server errors in state.
 */
export class YesodSocialKernelApi {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	entity(target, options = {}) {
		return this.get('/api/social/entity', target, options);
	}

	capabilities(target, options = {}) {
		return this.get('/api/social/entity/capabilities', target, options);
	}

	relations(target, options = {}) {
		return this.get('/api/social/entity/relations', target, options);
	}

	async batch(targets, options = {}) {
		return this.post('/api/social/entities/batch', {
			targets: JSON.stringify(targets),
			viewerAliasId: options.viewerAliasId || '',
			includeRelations: options.includeRelations ? 'true' : 'false'
		});
	}

	actionPreview(target, actionId, options = {}) {
		return this.post('/api/social/entity/action/preview', {
			...target,
			actionId,
			viewerAliasId: options.viewerAliasId || ''
		});
	}

	async get(path, target, options = {}) {
		const query = new URLSearchParams();
		for (const [key, value] of Object.entries({ ...target, viewerAliasId: options.viewerAliasId })) {
			if (value !== undefined && value !== null && String(value).trim()) query.set(key, String(value));
		}
		if (options.includeRelations) query.set('relations', '1');
		return this.request(`${path}?${query.toString()}`, { method: 'GET' });
	}

	async post(path, fields) {
		const body = new URLSearchParams();
		for (const [key, value] of Object.entries(fields || {})) {
			if (value !== undefined && value !== null) body.set(key, String(value));
		}
		return this.request(path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
			body: body.toString()
		});
	}

	async request(url, options) {
		const response = await this.fetcher(url, options);
		const result = await response.json().catch(() => null);
		if (!response.ok || result?.error) {
			throw new Error(result?.error?.message || `Social request failed with ${response.status}.`);
		}
		return result?.success ?? result?.data ?? result;
	}
}
