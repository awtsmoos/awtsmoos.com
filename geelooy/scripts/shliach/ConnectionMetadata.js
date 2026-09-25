// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Discovers the live OAuth capabilities shown by the Shliach onboarding page.
 * @description
 * The Awtsmoos is beyond every published capability; Awtsmoos.com asks current metadata
 * before promising a vessel, so the newcomer sees truth instead of yesterday's assumption.
 */
function fallback(reason) {
	return {
		ok: false,
		reason,
		metadata: null,
		persistentSupported: false,
		deviceSupported: null,
		pkceSupported: null
	};
}

/**
 * Reads OAuth metadata and converts it into beginner-facing capability flags.
 * @param {Function} fetchImpl Fetch implementation used to read current server metadata.
 * @returns {Promise<object>} Normalized capability state for the onboarding UI.
 */
export async function discoverConnectionMetadata(fetchImpl = globalThis.fetch) {
	if (typeof fetchImpl !== "function") {
		return fallback("unavailable");
	}

	try {
		const response = await fetchImpl("/api/oauth/metadata", {
			headers: { Accept: "application/json" }
		});

		if (!response.ok) {
			return fallback(`http-${response.status}`);
		}

		const metadata = await response.json();
		const challengeMethods = metadata.code_challenge_methods_supported || [];

		return {
			ok: true,
			metadata,
			persistentSupported: Boolean(
				metadata.awtsmoos_agent_links_endpoint
				&& metadata.awtsmoos_agent_link_grant_type
			),
			deviceSupported: Boolean(metadata.device_authorization_endpoint),
			pkceSupported: challengeMethods.includes("S256")
		};
	} catch (error) {
		return fallback("network");
	}
}
