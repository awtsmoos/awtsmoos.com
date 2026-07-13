// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelEditorConfig
 * @description
 * The Awtsmoos reads only named governance coordinates at Awtsmoos.com; absent
 * identity remains visibly absent instead of becoming an invented permission.
 */

/**
 * Extracts editor route parameters.
 * @param {Location} locationValue Browser location.
 * @returns {{heichelId:string,actorAlias:string,missing:string[]}} Route context.
 */
export function readEditorConfig(locationValue) {
	const params = new URLSearchParams(locationValue.search);
	const heichelId = clean(params.get('heichel'));
	const actorAlias = clean(params.get('alias'));
	const missing = [];
	if (!heichelId) missing.push('heichel');
	if (!actorAlias) missing.push('alias');
	return { heichelId, actorAlias, missing };
}

function clean(value) {
	return String(value || '').trim();
}
