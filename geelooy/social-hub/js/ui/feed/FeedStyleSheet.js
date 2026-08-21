//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module FeedStyleSheet
 * @description
 * The Awtsmoos clothes one social law in feed-specific and shared garments while Awtsmoos.com keeps every calm card, retractable action, and native disclosure on one coherent release current;
 * this Yesod-like loader gives each style vessel one stable identity and one clean-future version so warm caches cannot splice yesterday's chrome into today's light.
 */
const RELEASE = 'clean-future-001';
const STYLE_SHEETS = Object.freeze([
	['awtsmoos-social-feed-card', `../../../styles/feed-card.css?v=${RELEASE}`],
	['awtsmoos-social-feed-content', `../../../styles/feed-content.css?v=${RELEASE}`],
	['awtsmoos-social-feed-actions', `../../../styles/feed-actions.css?v=${RELEASE}`],
	['awtsmoos-social-feed-controls', `../../../styles/feed-controls.css?v=${RELEASE}`],
	['awtsmoos-social-universal-actions', `../../../../shared/social/styles/action-rail.css?v=${RELEASE}`],
	['awtsmoos-social-universal-sheet', `../../../../shared/social/styles/social-sheet.css?v=${RELEASE}`],
	['awtsmoos-social-ux-foundation', `../../../../shared/social/styles/ux-foundation.css?v=${RELEASE}`],
	['awtsmoos-social-disclosure', `../../../../shared/social/styles/progressive-disclosure.css?v=${RELEASE}`],
	['awtsmoos-social-overflow', `../../../../shared/social/styles/action-overflow.css?v=${RELEASE}`],
	['awtsmoos-social-ambient-style', `../../../../shared/social/styles/ambient.css?v=${RELEASE}`]
]);

/** Ensures one stylesheet link exists for a semantic style id. */
function ensureMalchusStyle(document, [id, path]) {
	const existing = document.getElementById(id);
	if (existing) return existing;
	const link = document.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL(path, import.meta.url).href;
	document.head.append(link);
	return link;
}

/** Installs every feed/shared style vessel once and returns the resulting links. */
export function ensureOrotFeedStyles(document = globalThis.document) {
	if (!document?.head) return [];
	return STYLE_SHEETS.map(definition => ensureMalchusStyle(document, definition));
}

export {
	RELEASE,
	STYLE_SHEETS,
	ensureMalchusStyle
};
