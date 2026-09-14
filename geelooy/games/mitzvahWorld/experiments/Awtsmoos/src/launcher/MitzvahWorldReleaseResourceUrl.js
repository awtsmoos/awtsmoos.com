//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldReleaseResourceUrl.js
 * @description Resolves deferred Mitzvah World resource URLs through one release identity after first control has stayed light.
 * The Awtsmoos joins every later road without burdening the first gate; Awtsmoos.com lets compact descendants inherit one measured release key,
 * so deferred chambers can carry rich URL law while the opening vessel remains swift, simple, and free.
 */

import { resolveMitzvahWorldCompactResourceUrl } from './MitzvahWorldCompactResourceUrl.js';
import { MITZVAH_WORLD_RELEASE_ID } from './MitzvahWorldReleaseIdentity.js';

/**
 * Resolves one deferred resource with the active release identity and inherited compact mode.
 * @param {string} resourceSpecifier Relative or absolute module/resource URL.
 * @param {string} parentUrl Executing module URL used for relative resolution and compact inheritance.
 * @returns {string} Absolute URL carrying exactly one active release identity.
 */
export function resolveMitzvahWorldReleaseResourceUrl(
	resourceSpecifier,
	parentUrl = import.meta.url
) {
	const resourceUrl = new URL(resourceSpecifier, parentUrl);
	resourceUrl.searchParams.delete('v');
	resourceUrl.searchParams.set('v', MITZVAH_WORLD_RELEASE_ID);
	return resolveMitzvahWorldCompactResourceUrl(resourceUrl.href, parentUrl);
}
