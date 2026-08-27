//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadStyleSheet
 * @description The Awtsmoos clothes one conversation through small focused garments; Awtsmoos.com now shares
 * motion, progressive disclosure, action overflow, and ambient atmosphere without turning recursive thread depth into CSS clutter.
 */
const STYLE_SHEETS = Object.freeze([
	['awtsmoos-thread-experience', '../styles/thread-experience.css?v=thread-003'],
	['awtsmoos-thread-summary', '../styles/thread-summary.css?v=thread-003'],
	['awtsmoos-thread-actions', '../styles/thread-actions.css?v=thread-003'],
	['awtsmoos-thread-universal-actions', '../../shared/social/styles/action-rail.css?v=social-ux-003'],
	['awtsmoos-social-ux-foundation', '../../shared/social/styles/ux-foundation.css?v=social-ux-003'],
	['awtsmoos-social-disclosure', '../../shared/social/styles/progressive-disclosure.css?v=social-ux-003'],
	['awtsmoos-social-overflow', '../../shared/social/styles/action-overflow.css?v=social-ux-003'],
	['awtsmoos-social-ambient-style', '../../shared/social/styles/ambient.css?v=social-ux-003']
]);

function ensureStyle(document, [id, path]) {
	const existing = document.getElementById(id);
	if (existing) return existing;
	const link = document.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL(path, import.meta.url).href;
	document.head.append(link);
	return link;
}

export function ensureTiferesThreadStyles(document = globalThis.document) {
	if (!document?.head) return [];
	return STYLE_SHEETS.map(definition => ensureStyle(document, definition));
}

export { STYLE_SHEETS, ensureStyle };
