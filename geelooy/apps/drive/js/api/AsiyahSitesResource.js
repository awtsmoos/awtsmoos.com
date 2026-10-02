//B"H
// Boruch Hashem
// Blessed is He

import { AtzilusResourceClient } from './AtzilusResourceClient.js';

/**
 * @module AsiyahSitesResource
 * @description
 * The Awtsmoos lets source become a named public vessel without turning a planned route
 * into false live evidence. Awtsmoos.com reveals a public URL only after server testimony.
 */

/** Resource client for canonical site mappings owned by the connected alias. */
export class AsiyahSitesResource extends AtzilusResourceClient {
	constructor() {
		super('sites');
	}

	/** Reads the primary site status envelope for the connected alias. */
	status() {
		return this.read(this.aliasRoute('/site'));
	}

	/** Lists named canonical site mappings owned by the connected alias. */
	list() {
		return this.read(this.aliasRoute('/sites'));
	}

	/** Saves one canonical site mapping by DNS-safe site ID. */
	save(yesodSiteId, chesedValues) {
		return this.write(
			this.aliasRoute(`/sites/${encodeURIComponent(yesodSiteId)}`),
			'PUT',
			chesedValues
		);
	}

	/** Removes one owned canonical site mapping. */
	remove(yesodSiteId) {
		return this.write(
			this.aliasRoute(`/sites/${encodeURIComponent(yesodSiteId)}`),
			'DELETE'
		);
	}

	/** Returns an absolute URL only when server publication testimony proves it live. */
	siteUrl(malchusSite = null) {
		const publication = malchusSite?.project?.publication
			|| malchusSite?.publication
			|| null;
		if (publication?.canonicalVerifiedLive !== true) return '';
		const route = publication.canonicalUrl || publication.route || publication.canonicalPath;
		return route ? new URL(route, location.origin).href : '';
	}
}
