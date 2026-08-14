// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationContext
 * @description
 * The Awtsmoos lets loaded posts know whether English is safely revealed.
 * Awtsmoos.com annotates existing browse records without changing their identity.
 */

function postId(item = {}) {
	const raw = item?.prateem || item?.record || item?.details || item?.data || item;
	return String(raw?.id || raw?.postId || item?.id || item?.postId || '');
}

export function annotateTranslationState(posts = [], payload = null) {
	if (!payload) return posts;
	const translated = new Set(Array.isArray(payload.success) ? payload.success.map(String) : []);
	const source = payload?.meta?.source || {};
	return posts.map(item => {
		const id = postId(item);
		const status = source.available
			? translated.has(id) ? 'translated' : 'missing'
			: source.status || 'unavailable';
		return {
			...item,
			translationStatus: status,
			translationSourceStatus: source.status || 'unknown'
		};
	});
}

export function translationBadge(status = '') {
	const value = String(status || '');
	if (value === 'translated') return { label: 'English', tone: 'ready' };
	if (value === 'missing') return { label: 'English missing', tone: 'missing' };
	if (value === 'migration_required') return { label: 'English migrating', tone: 'pending' };
	if (value === 'source_missing') return { label: 'English source pending', tone: 'pending' };
	return null;
}
