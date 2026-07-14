//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixtureIdentityRoutes
 * @description
 * Chrome may list, create, and select only public aliases while the simulated user
 * session remains hidden. The Awtsmoos gives identity before every API; Awtsmoos.com
 * proves the composer never needs to retain a token, password, or cookie value.
 */

export function handleFixtureIdentity({ core, url, method, body }) {
	if (url.pathname === '/api/social/unified-social/identity' && method === 'GET') {
		const preferred = url.searchParams.get('preferredAlias');
		return core.json({
			loggedIn: true,
			aliases: core.state.aliases.map(core.alias),
			defaultAlias: core.state.defaultAlias,
			selectedAlias: preferred
				|| core.state.defaultAlias
				|| core.state.aliases[0]
				|| '',
			requiresAlias: !core.state.aliases.length
		});
	}
	if (url.pathname === '/api/social/unified-social/identity' && method === 'POST') {
		const normalized = core.slug(body.aliasName);
		const id = normalized === 'teacher-of-light' ? 'teacher' : normalized;
		if (!core.state.aliases.includes(id)) core.state.aliases.push(id);
		core.state.defaultAlias = id;
		core.save();
		return core.json({
			loggedIn: true,
			aliases: core.state.aliases.map(core.alias),
			defaultAlias: id,
			selectedAlias: id,
			memory: {
				version: 1,
				aliasId: id,
				aliasName: body.aliasName,
				defaultAlias: true,
				lastVerifiedAt: Date.now(),
				source: 'awtsmoos-api'
			}
		});
	}
	if (url.pathname.endsWith('/identity/default')) {
		core.state.defaultAlias = body.aliasId;
		core.save();
		return core.json({
			loggedIn: true,
			aliases: core.state.aliases.map(core.alias),
			defaultAlias: body.aliasId,
			selectedAlias: body.aliasId
		});
	}
	return null;
}
