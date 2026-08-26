//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialAuthorityCapability
 * @description The Awtsmoos gives authorship and stewardship distinct vessels; Awtsmoos.com resolves both once per request so capability truth never repeats expensive authority questions.
 */
const { verifyHeichelAuthority } = require('../../index.js');

/** Resolves the canonical author alias from normalized and historical entity shapes. */
function authorAlias(entity = {}) {
	return String(
		entity.raw?.authorAliasId
		|| entity.raw?.aliasId
		|| entity.raw?.author
		|| entity.aliasId
		|| ''
	);
}

/** Builds the request-scoped cache key for one alias/Heichel authority question. */
function authorityKey(entity = {}, viewerAliasId = '') {
	return `${String(viewerAliasId || '')}:${String(entity.heichelId || '')}`;
}

/** Reads Heichel authority while converting backend failure into conservative false. */
async function readAuthority({ $i, entity, viewerAliasId }) {
	try {
		return Boolean(await verifyHeichelAuthority({
			$i,
			heichelId: entity.heichelId,
			aliasId: viewerAliasId
		}));
	} catch {
		return false;
	}
}

/** Resolves and memoizes one request-scoped Heichel authority decision. */
async function heichelAuthority({ $i, entity, viewerAliasId, authorityCache = null }) {
	if (!entity.heichelId || !viewerAliasId) return false;
	const key = authorityKey(entity, viewerAliasId);
	if (authorityCache?.has(key)) return Boolean(await authorityCache.get(key));
	const pending = readAuthority({ $i, entity, viewerAliasId });
	authorityCache?.set(key, pending);
	const result = await pending;
	authorityCache?.set(key, result);
	return result;
}

module.exports = { authorityKey, authorAlias, heichelAuthority, readAuthority };
