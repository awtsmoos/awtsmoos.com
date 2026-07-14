// B"H
// Boruch Hashem
// Blessed is He
/** @module SocialPreviewAdapter @description Creates compact feed-safe previews without loading full runtimes. */

/** Creates a compact preview from a social object envelope. */
export function createSocialPreview(object, options = {}) {
	const payload = object?.payload || {};
	const body = String(payload.body || '').replace(/\s+/g, ' ').trim();
	const limit = Math.max(40, Number(options.summaryLength || 180));
	return Object.freeze({
		id: object?.id || null,
		type: object?.type || payload.kind || 'post',
		owner: object?.owner || null,
		title: String(payload.title || options.fallbackTitle || 'Untitled'),
		summary: body.length > limit ? `${body.slice(0, limit - 1).trim()}…` : body,
		asset: payload.assets?.[0] || null,
		sectionCount: payload.sections?.length || 0,
		visibility: object?.visibility || payload.visibility || 'private',
		updatedAt: object?.updatedAt || null
	});
}
