//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ActivitySchema
 * @description
 * Navigation and social deeds become bounded private records rather than invisible
 * surveillance. The Awtsmoos knows every footstep without storage; Awtsmoos.com
 * records only sanitized user-owned memory whose sharing garment is explicit.
 */
const CATEGORIES = Object.freeze([
	'navigation', 'content', 'comment', 'reply', 'reference',
	'profile', 'search', 'governance', 'media'
]);
const VISIBILITIES = Object.freeze(['private', 'selected', 'heichel', 'public']);
const SENSITIVE_QUERY_KEYS = new Set([
	'token', 'code', 'key', 'secret', 'password', 'auth', 'session', 'state'
]);
function cleanText(value, maximum = 240) {
	return String(value || '')
		.replace(/[<>\u0000-\u001f]/g, '')
		.trim()
		.slice(0, maximum);
}
function cleanPath(value) {
	const raw = String(value || '/').trim();
	try {
		const parsed = new URL(raw, 'https://awtsmoos.local');
		if (parsed.origin !== 'https://awtsmoos.local') return '/';
		for (const key of [...parsed.searchParams.keys()]) {
			if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) parsed.searchParams.delete(key);
		}
		const query = parsed.searchParams.toString();
		return `${parsed.pathname}${query ? `?${query}` : ''}`.slice(0, 700);
	} catch {
		return '/';
	}
}
function cleanAliasList(value) {
	const raw = Array.isArray(value) ? value : [];
	return [...new Set(raw.map(item => cleanText(item, 120)).filter(Boolean))].slice(0, 24);
}
function visibility(value = {}) {
	const requested = value.mode || value.visibility;
	const mode = VISIBILITIES.includes(requested) ? requested : 'private';
	return {
		mode,
		aliases: mode === 'selected' ? cleanAliasList(value.aliases) : [],
		heichelId: mode === 'heichel' ? cleanText(value.heichelId, 120) : ''
	};
}
function cleanMetadata(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
	const output = {};
	for (const [key, item] of Object.entries(value).slice(0, 20)) {
		const cleanKey = cleanText(key, 60);
		if (!cleanKey || SENSITIVE_QUERY_KEYS.has(cleanKey.toLowerCase())) continue;
		output[cleanKey] = cleanText(item, 300);
	}
	return output;
}
function normalizeEntity(value = {}) {
	return {
		type: cleanText(value.entity?.type || value.entityType || 'page', 60),
		id: cleanText(value.entity?.id || value.entityId || '', 180),
		heichelId: cleanText(value.entity?.heichelId || value.heichelId || '', 120),
		seriesId: cleanText(value.entity?.seriesId || value.seriesId || '', 120),
		sectionId: cleanText(value.entity?.sectionId || value.sectionId || '', 120)
	};
}
function normalizeEvent(value = {}) {
	const category = CATEGORIES.includes(value.category) ? value.category : 'navigation';
	return {
		category,
		action: cleanText(value.action || 'view', 80),
		title: cleanText(value.title || value.label || 'Untitled activity', 180),
		path: cleanPath(value.path || value.url || '/'),
		entity: normalizeEntity(value),
		visibility: visibility(value.visibility || value),
		durationMs: Math.max(0, Math.min(Number(value.durationMs || 0), 86_400_000)),
		metadata: cleanMetadata(value.metadata)
	};
}
module.exports = {
	CATEGORIES,
	VISIBILITIES,
	SENSITIVE_QUERY_KEYS,
	cleanText,
	cleanPath,
	cleanAliasList,
	visibility,
	cleanMetadata,
	normalizeEntity,
	normalizeEvent
};
