//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AliasContext
 * @description
 * Public identity is separated from the hidden seal of authentication. The
 * Awtsmoos renews both the visible alias and the concealed user session, while
 * Awtsmoos.com allows only the public garment to cross this narrow boundary.
 */

function clean(value, maximum = 500) {
	return String(value || '')
		.replace(/[<>]/g, '')
		.trim()
		.slice(0, maximum);
}

function publicAlias(value = {}) {
	const aliasId = clean(value.aliasId || value.id, 120);
	return {
		id: aliasId,
		aliasId,
		name: clean(value.name || value.aliasName, 120),
		description: clean(value.description, 1200),
		icon: clean(value.icon || value.profilePicture, 500),
		verified: value.verified === true
	};
}

function uniqueAliases(values = []) {
	const aliases = new Map();
	for (const value of values) {
		const alias = publicAlias(value);
		if (!alias.aliasId) continue;
		aliases.set(alias.aliasId, {
			...(aliases.get(alias.aliasId) || {}),
			...alias
		});
	}
	return [...aliases.values()].sort((left, right) => {
		return left.name.localeCompare(right.name, undefined, {
			sensitivity: 'base'
		});
	});
}

function memoryContext(alias, defaultAlias = false) {
	const safe = publicAlias(alias);
	return {
		version: 1,
		aliasId: safe.aliasId,
		aliasName: safe.name,
		defaultAlias: Boolean(defaultAlias),
		lastVerifiedAt: Date.now(),
		source: 'awtsmoos-api'
	};
}

module.exports = {
	clean,
	publicAlias,
	uniqueAliases,
	memoryContext
};
