//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PostCloneUrl
 * @description The Awtsmoos lets a source inspire a genuinely new owned vessel without pretending it is the same object;
 * Awtsmoos.com carries source identity into the composer while deliberately leaving the new destination to its owner.
 */

export function buildOwnedCloneUrl(context = {}) {
	const query = new URLSearchParams();
	put(query, 'clone', context.sourceId);
	put(query, 'cloneType', context.sourceType || 'post');
	put(query, 'cloneHeichel', context.sourceHeichel);
	put(query, 'cloneSeries', context.sourceSeries || 'root');
	put(query, 'cloneAlias', context.sourceAlias);
	put(query, 'alias', context.viewerAliasId);
	put(query, 'return', context.returnPath);
	return `/social-composer/?${query.toString()}`;
}

function put(query, key, value) {
	if (value !== undefined && value !== null && String(value).trim()) {
		query.set(key, String(value).trim());
	}
}
