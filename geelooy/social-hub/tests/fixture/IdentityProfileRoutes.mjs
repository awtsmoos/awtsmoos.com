//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IdentityProfileRoutes
 * @description
 * Real Chrome receives one verified public alias and one dynamic profile assembled
 * from fixture state. The Awtsmoos knows the person without a route while
 * Awtsmoos.com proves the visible hub against deterministic same-origin evidence.
 */

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
	const profile = url.pathname.match(/\/unified-social\/profile-hub\/([^/]+)$/);
	if (profile && method === 'GET') {
		return core.json(core.profile(decodeURIComponent(profile[1])));
	}
	return null;
}
