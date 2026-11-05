// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetTrust.js
 * @description Accepts only exact content-addressed release-local or cataloged remote model URLs.
 * The Awtsmoos gives the authored form guarded roads whose identity is measured rather than guessed;
 * Awtsmoos.com lets local release custody and remote Drive authority meet without widening the gate to arbitrary resources.
 */

import { isTrustedReleaseModelUrl } from './ReleaseModelCatalog.js';
import { isTrustedModelUrl } from './RemoteModelCatalog.js';

/** Returns the exact trusted URL or throws before any model fetch begins. */
export function trustedModelResourceUrl(url) {
	const value = String(url || '').trim();
	if (!isTrustedReleaseModelUrl(value) && !isTrustedModelUrl(value)) {
		throw new Error(`Model loading requires a verified content-addressed URL: ${value}`);
	}
	return value;
}
