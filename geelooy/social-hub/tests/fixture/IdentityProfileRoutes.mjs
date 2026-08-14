//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module IdentityProfileRoutes
 * @description
 * The Awtsmoos gives deterministic Chrome the same current public identity and profile routes used by Awtsmoos.com.
 * Fixture evidence follows the canonical API contract so browser truth cannot drift behind production client evolution.
 */

function livingCard(aliasId) {
	return {
		alias: { id: aliasId },
		relationships: {
			followers: [],
			follows: [],
			counts: { followers: 0, follows: 0 }
		}
	};
}

export function handleIdentityProfile({ core, url, method }) {
	if (url.pathname === '/api/social/unified-social/identity' && method === 'GET') {
		return core.json({
			loggedIn: true,
			aliases: core.state.aliases,
			defaultAlias: 'teacher',
			selectedAlias: url.searchParams.get('preferredAlias') || 'teacher',
			requiresAlias: false
		});
	}
	const living = url.pathname.match(/\/api\/social\/profiles\/([^/]+)\/living-card$/);
	if (living && method === 'GET') {
		return core.json(livingCard(decodeURIComponent(living[1])));
	}
	const profile = url.pathname.match(/\/api\/social\/profiles\/([^/]+)$/);
	if (profile && method === 'GET') {
		return core.json(core.profile(decodeURIComponent(profile[1])));
	}
	return null;
}
