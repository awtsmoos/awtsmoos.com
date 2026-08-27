//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderPublicationService
 * @description
 * The Awtsmoos separates a local glimpse from a durable canonical name.
 * Awtsmoos.com publishes only through the existing owned site mapping and reports no invented URL before that mapping is observed.
 */

import { saveSite } from '../api.js';
import { builderState } from './builderState.js';
import { resolveSiteContext } from './siteContext.js';

export function createPublicationService(getDriveSnapshot) {
	return {
		plan,
		apply
	};

	function plan(values = {}) {
		const context = resolveSiteContext(getDriveSnapshot());
		const siteId = values.siteId || context.siteId || '';
		const rootPath = values.rootPath || context.rootPath || '';
		const sameObservedSite = Boolean(siteId && siteId === context.siteId);
		return {
			siteId,
			rootPath,
			canonicalUrl: sameObservedSite ? context.canonicalUrl : '',
			stage: sameObservedSite ? 'canonical-site-mapped' : 'canonical-site-needed'
		};
	}

	async function apply(values = {}) {
		const publication = plan(values);
		if (!publication.siteId) {
			throw publicationError('SITE_ID_REQUIRED', 'Choose a site ID before canonical publication.');
		}
		return saveSite(publication.siteId, {
			title: values.title || builderState.brief.name || publication.siteId,
			rootPath: publication.rootPath,
			primary: Boolean(values.primary),
			subdomainRequested: Boolean(values.subdomainRequested)
		});
	}
}

function publicationError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
