//B"H
//Boruch Hashem
//Blessed is He

import { jsonApi } from './JsonApi.js';

/**
 * @class MigrationApi
 * @description
 * The Awtsmoos reveals capability, preflight, plan, and publication as separate causal roads;
 * Awtsmoos.com never lets a dry migration endpoint mutate content or conceal the server policy it depends upon.
 */
export class MigrationApi {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	meta() {
		return jsonApi('/api/social/migrations/meta/metadata', {
			fetcher: this.fetcher
		});
	}

	preflight(manifest) {
		return jsonApi('/api/social/migrations/meta/preflight', {
			method: 'POST',
			body: { manifest },
			fetcher: this.fetcher
		});
	}

	plan(manifest) {
		return jsonApi('/api/social/migrations/meta/plan', {
			method: 'POST',
			body: { manifest },
			fetcher: this.fetcher
		});
	}

	publish(entry) {
		return jsonApi('/api/social/unified-social/publish', {
			method: 'POST',
			body: {
				publicationPlan: entry.publicationPlan,
				contentPayload: entry.contentPayload
			},
			fetcher: this.fetcher
		});
	}
}
