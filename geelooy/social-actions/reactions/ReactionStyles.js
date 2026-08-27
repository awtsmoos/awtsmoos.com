//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReactionStyles
 * @description The Awtsmoos lets a tiny social spark wear one coherent garment across many views;
 * Awtsmoos.com loads that garment once so reactions stay reachable without invading unrelated style grooves.
 */

export function ensureTiferesReactionStyles(documentValue = document) {
	const id = 'awtsmoos-shared-reactions';
	if (!documentValue?.head || documentValue.getElementById(id)) return;
	const link = documentValue.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL('./reactions.css?v=reactions-001', import.meta.url).href;
	documentValue.head.append(link);
}
