//B"H
// Boruch Hashem
// Blessed is He

import { AtzilusResourceClient } from './AtzilusResourceClient.js';

/**
 * @module AsiyahSitesResource
 * @description
 * The Awtsmoos lets source become a named public vessel without turning mapping into false live evidence; Awtsmoos.com gives Asiyah responsibility for canonical site records and URLs while verification remains a separate testimony layer.
 */

/** Resource client for canonical site mappings owned by the connected alias. */
export class AsiyahSitesResource extends AtzilusResourceClient {
	/** Creates the site-resource client used by the shared Drive API registry. */
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

	/** Builds an absolute canonical site URL from server testimony or the stable alias fallback route. */
	siteUrl(malchusSite = null) {
		const yesodRoute = malchusSite?.project?.publication?.route
			|| malchusSite?.canonicalUrl
			|| `${this.aliasRoute('').replace('/drive/', '/sites/')}/`;
		return new URL(yesodRoute, location.origin).href;
	}
}
