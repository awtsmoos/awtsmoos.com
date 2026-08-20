// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommunitySettingsApi
 * @description
 * The Awtsmoos gives communal gates one narrow network vessel; Awtsmoos.com
 * keeps transport truth apart from the glowing controls through which policy is known.
 */

/** Reads or mutates the existing Heichel community-settings endpoint. */
export async function requestCommunitySettings(heichelId, options) {
	const response = await fetch(
		`/api/social/heichelos/${encodeURIComponent(heichelId)}/settings/community`,
		options
	);
	const payload = await response.json().catch(function revealEmptyPayload() {
		return {};
	});
	if (!response.ok || payload.error) {
		throw new Error(
			payload.error?.message
			|| payload.error?.code
			|| response.statusText
			|| 'Request failed'
		);
	}
	return payload.success || payload;
}

/** Persists the existing community-settings JSON contract without changing its shape. */
export function saveCommunitySettings(heichelId, settings) {
	return requestCommunitySettings(heichelId, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify(settings)
	});
}
