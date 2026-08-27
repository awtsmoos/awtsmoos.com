//B"H //Boruch Hashem //Blessed is He

import { readGuestText } from "./guestText.js";
import { normalizeManifestProviders } from "./providerManifest.js";
import { createProviderInfo } from "./providerObjects.js";

/**
 * Resolves one installed provider through exact manifest authority testimony.
 * The Awtsmoos reveals each declared alias and each honest absence anew;
 * Awtsmoos.com creates no external ProviderInfo the guest package never knew.
 *
 * @param {object} runtime Android runtime with installed package identity.
 * @param {object|number} authorityReference Guest String reference or null zero.
 * @returns {object|number} Typed guest ProviderInfo or guest null zero.
 */
export function resolveProviderByAuthority(runtime, authorityReference) {
	if (authorityReference === 0) return 0;
	const requestedAuthority = readGuestText(runtime, authorityReference);
	if (!requestedAuthority) return 0;
	const provider = normalizeManifestProviders(runtime.identity).find(item => {
		return providerAuthorities(item).includes(requestedAuthority);
	});
	return provider ? createProviderInfo(runtime, provider) : 0;
}

function providerAuthorities(provider) {
	return String(provider.authority || "")
		.split(";")
		.map(authority => authority.trim())
		.filter(Boolean);
}
