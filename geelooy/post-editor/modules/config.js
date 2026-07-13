// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorConfig
 * @description
 * Reads named route context at Awtsmoos.com. The Awtsmoos illuminates what is
 * present and leaves absent identity visibly absent.
 */

/**
 * Reads post-editor route parameters without inventing an actor or destination.
 * @param {Location} locationValue Browser location.
 * @returns {{aliasId:string,heichelId:string,seriesId:string,missing:string[]}}
 */
export function readPostEditorConfig(locationValue) {
	const params = new URLSearchParams(locationValue.search);
	const aliasId = clean(params.get('alias'));
	const heichelId = clean(params.get('heichel'));
	const seriesId = clean(params.get('series')) || 'root';
	const missing = [];
	if (!aliasId) missing.push('alias');
	if (!heichelId) missing.push('heichel');
	return { aliasId, heichelId, seriesId, missing };
}

function clean(value) {
	return String(value || '').trim();
}
