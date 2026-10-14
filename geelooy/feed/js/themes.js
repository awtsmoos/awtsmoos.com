// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedThemes
 * @description
 * Yaakov 2026-10-13: themes are real. Every post can carry its author's
 * chosen theme, every heichel can set a default theme, and the reader
 * applies the post's theme when you view it — falling back to the
 * heichel's theme, then to your own global feed theme.
 *
 * Persistence is local-first: choices save to localStorage instantly and
 * a best-effort POST tries to persist them server-side. A missing server
 * route never breaks the UI.
 */

export const THEMES = [
	{ id: 'dark-immersive', name: 'Immersive', swatch: ['#0b0d12', '#d4a94e'] },
	{ id: 'light-parchment', name: 'Parchment', swatch: ['#f4ead2', '#7a5a1a'] },
	{ id: 'classic', name: 'Classic', swatch: ['#101318', '#5bddff'] },
	{ id: 'parchment-aged', name: 'Aged', swatch: ['#e3cfa0', '#7a5a1a'] },
	{ id: 'parchment-clean', name: 'Clean', swatch: ['#f7f0dd', '#8a6f42'] },
	{ id: 'parchment-night', name: 'Night', swatch: ['#1c1710', '#d4a94e'] },
	{ id: 'parchment-golden', name: 'Golden', swatch: ['#f0dfa8', '#a31621'] }
];

export const THEME_IDS = THEMES.map(t => t.id);
export const DEFAULT_THEME = 'dark-immersive';

/** Built-in heichel defaults. Heichel owners can override these. */
const HEICHEL_DEFAULTS = {
	'chassidus': 'parchment-aged',
	'mittler-rebbe-novels': 'parchment-golden',
	'tanach': 'parchment-clean'
};

export function isThemeId(id) {
	return THEME_IDS.includes(String(id));
}

export function themeById(id) {
	return THEMES.find(t => t.id === String(id)) || null;
}

function lsGet(key) {
	try { return localStorage.getItem(key); } catch (_) { return null; }
}

function lsSet(key, value) {
	try {
		if (value === null || value === undefined) localStorage.removeItem(key);
		else localStorage.setItem(key, String(value));
	} catch (_) { /* private mode */ }
}

/* ============ global viewer theme ============ */

export function globalTheme() {
	const t = lsGet('awtsmoos-feed-theme');
	return isThemeId(t) ? t : DEFAULT_THEME;
}

export function setGlobalTheme(id) {
	if (!isThemeId(id)) return false;
	lsSet('awtsmoos-feed-theme', id);
	document.getElementById('feed-stage')?.setAttribute('data-feed-theme', id);
	return true;
}

/* ============ per-heichel theme ============ */

function heichelKey(h) {
	return `awtsmoos-heichel-theme:${String(h || '').toLowerCase()}`;
}

export function getHeichelTheme(heichelId) {
	const h = String(heichelId || '').toLowerCase();
	const saved = lsGet(heichelKey(h));
	if (isThemeId(saved)) return saved;
	return HEICHEL_DEFAULTS[h] || null;
}

export function setHeichelTheme(heichelId, themeId) {
	const h = String(heichelId || '');
	if (themeId !== null && !isThemeId(themeId)) return false;
	lsSet(heichelKey(h), themeId);
	// Best-effort server persistence; a 404 here is fine.
	try {
		fetch(`/api/social/heichelos/${encodeURIComponent(h)}/theme`, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ theme: themeId })
		}).catch(() => {});
	} catch (_) {}
	return true;
}

/* ============ per-post theme ============ */

function postKey(h, p) {
	return `awtsmoos-post-theme:${String(h || '').toLowerCase()}:${String(p || '')}`;
}

function postIds(item = {}) {
	return {
		h: String(item.heichelId || 'ikar'),
		p: String(item.postId || item.id || '')
	};
}

/**
 * The theme that applies when VIEWING a post: author's choice first,
 * then a viewer override, then the heichel default, then global.
 */
export function resolvePostTheme(item = {}) {
	const { h, p } = postIds(item);
	if (p) {
		const viewer = lsGet(`awtsmoos-reader-theme:${h.toLowerCase()}:${p}`);
		if (isThemeId(viewer)) return viewer;
		const mine = lsGet(postKey(h, p));
		if (isThemeId(mine)) return mine;
	}
	if (item.theme && isThemeId(item.theme)) return item.theme;
	if (item.postTheme && isThemeId(item.postTheme)) return item.postTheme;
	return getHeichelTheme(item.heichelId) || globalTheme();
}

/** Author sets the theme for their own post. */
export function setPostTheme(item = {}, themeId) {
	if (!isThemeId(themeId)) return false;
	const { h, p } = postIds(item);
	if (!p) return false;
	lsSet(postKey(h, p), themeId);
	try {
		fetch(`/api/social/heichelos/${encodeURIComponent(h)}/posts/${encodeURIComponent(p)}/theme`, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ theme: themeId })
		}).catch(() => {});
	} catch (_) {}
	return true;
}

/** Viewer picks a personal reading theme for one post ("Auto" clears it). */
export function setReaderTheme(item = {}, themeId) {
	const { h, p } = postIds(item);
	if (!p) return false;
	if (themeId === null || themeId === 'auto') {
		lsSet(`awtsmoos-reader-theme:${h.toLowerCase()}:${p}`, null);
		return true;
	}
	if (!isThemeId(themeId)) return false;
	lsSet(`awtsmoos-reader-theme:${h.toLowerCase()}:${p}`, themeId);
	return true;
}

/** Applies a theme to any element via the data-feed-theme attribute. */
export function applyThemeAttr(el, themeId) {
	if (!el) return;
	if (isThemeId(themeId)) el.setAttribute('data-feed-theme', themeId);
	else el.removeAttribute('data-feed-theme');
}
