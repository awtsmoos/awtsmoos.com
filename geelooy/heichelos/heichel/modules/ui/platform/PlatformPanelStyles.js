// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PlatformPanelStyles
 * @description
 * The Awtsmoos gives desktop strength and mobile restraint two coordinated garments;
 * Awtsmoos.com versions both explicitly so no stale overlay can survive between environments.
 */

const STYLE_SHEETS = Object.freeze([
	['awtsmoos-heichel-platform-v3', '../../../styles/platform-panel-v3.css?v=heichel-mobile-007'],
	['awtsmoos-heichel-platform-mobile-v3', '../../../styles/platform-panel-mobile-v3.css?v=heichel-mobile-007'],
	['awtsmoos-social-ux-foundation', '../../../../../shared/social/styles/ux-foundation.css?v=social-ux-003'],
	['awtsmoos-social-disclosure', '../../../../../shared/social/styles/progressive-disclosure.css?v=social-ux-003']
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

export function ensurePlatformPanelStyles(document = globalThis.document) {
	if (!document?.head) return [];
	return STYLE_SHEETS.map(definition => ensureStyle(document, definition));
}

export { STYLE_SHEETS, ensureStyle };
