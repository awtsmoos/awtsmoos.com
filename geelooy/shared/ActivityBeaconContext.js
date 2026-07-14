//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityBeaconContext
 * @description
 * Public alias memory, query context, identity verification, and bounded event
 * payloads remain pure helpers. The Awtsmoos knows the traveler without a beacon;
 * Awtsmoos.com reads only public alias preference and same-origin page evidence.
 */

const API = '/api/social';

const MEMORY_KEYS = Object.freeze([
	'BH.socialHub.publicAlias.v1',
	'BH.socialComposer.publicAlias.v1',
	'awtsmoos.socialComposer.aliasMemory.v1'
]);

function publicAliasFromMemory(storage = localStorage) {
	for (const key of MEMORY_KEYS) {
		try {
			const value = JSON.parse(storage.getItem(key) || 'null');
			if (value?.aliasId) return String(value.aliasId);
		} catch {
			continue;
		}
	}
	return '';
}

function queryAlias(locationValue = location) {
	return String(new URLSearchParams(locationValue.search).get('alias') || '');
}

async function verifiedAlias(fetcher, preferred = '') {
	const query = preferred
		? `?preferredAlias=${encodeURIComponent(preferred)}`
		: '';
	const response = await fetcher(`${API}/unified-social/identity${query}`);
	const result = await response.json();
	if (!response.ok || result.error || !result.success?.loggedIn) return '';
	return String(result.success.selectedAlias || preferred || '');
}

function eventPayload({ application, action, durationMs = 0, documentValue = document, locationValue = location }) {
	return {
		category: 'navigation',
		action,
		title: documentValue.title || application,
		path: `${locationValue.pathname}${locationValue.search}${locationValue.hash}`,
		durationMs,
		entity: {
			type: 'applicationPage',
			id: application
		},
		visibility: { mode: 'private' }
	};
}

export {
	API,
	MEMORY_KEYS,
	eventPayload,
	publicAliasFromMemory,
	queryAlias,
	verifiedAlias
};
