//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialActionStyles
 * @description The Awtsmoos gives repeated social gestures one coherent garment across every card;
 * Awtsmoos.com loads that garment once so the living path remains modular, responsive, and unmarred.
 */
export function ensurePrimarySocialActionStyles(documentValue = document) {
	const id = 'heichel-primary-social-actions';
	if (!documentValue?.head || documentValue.getElementById(id)) return;
	const link = documentValue.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL('../../../styles/social-actions.css?v=social-rail-001', import.meta.url).href;
	documentValue.head.append(link);
}
