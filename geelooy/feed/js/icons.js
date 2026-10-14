// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedIcons
 * @description
 * Yaakov 2026-10-11: the Awtsmoos feed carries its own hand-cut icon set —
 * stroke icons drawn for the feed's gold-on-dark visual language. Inline SVG
 * keeps every icon at zero HTTP cost and infinitely crisp; ICON_CDN_BASE lets
 * a future pass flip individual icons to Drive-hosted PNGs without touching
 * call sites (Drive upload needs user credentials, which this build does not
 * carry — PNG masters are staged under ~/workspace/feed-overhaul/icons-png/).
 *
 * Usage: icon('like', 'feed-ic') -> '<svg ...>...</svg>'
 * Every icon ships with full interactive states via CSS classes in feed.css:
 * .feed-ic-btn:hover / :active / :focus-visible / :disabled.
 */

export const ICON_CDN_BASE = '';

const PATHS = {
	like: '<path d="M12 20.3C6.4 16.9 3 13.3 3 9.6 3 7 5 5 7.6 5c1.7 0 3.3.9 4.4 2.4C13.1 5.9 14.7 5 16.4 5 19 5 21 7 21 9.6c0 3.7-3.4 7.3-9 10.7z"/>',
	comment: '<path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
	share: '<path d="M12 3v10"/><path d="M8 6.5 12 3l4 3.5"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/>',
	save: '<path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z"/>',
	search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
	home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10.5V20h12v-9.5"/><path d="M10 20v-5h4v5"/>',
	flame: '<path d="M12 21c-4 0-7-2.8-7-6.8 0-3 1.8-5.3 3.4-7.2.4 1.2 1 2.3 2 3.1.2-2.4 1.2-4.7 2.9-6.6 2.6 2.3 5.7 5.6 5.7 10.7 0 4-3 6.8-7 6.8z"/><path d="M12 21c-2 0-3.6-1.4-3.6-3.4 0-1.5.9-2.6 1.8-3.6.3.6.7 1.1 1.2 1.5.2-1.2.7-2.3 1.5-3.2 1.3 1.2 2.7 2.9 2.7 5.3 0 2-1.6 3.4-3.6 3.4z"/>',
	compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
	users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3.5 20c.6-3.4 2.8-5.5 5.5-5.5s4.9 2.1 5.5 5.5"/><circle cx="16.5" cy="10" r="2.6"/><path d="M16 14.7c2.3.3 3.9 2 4.4 4.3"/>',
	spark: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
	close: '<path d="M6 6l12 12M18 6 6 18"/>',
	chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
	chevronUp: '<path d="m6 14.5 6-6 6 6"/>',
	image: '<rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m5.5 17.5 4.5-4.5 3 3 2.5-2.5 3 3"/>',
	video: '<rect x="3.5" y="6" width="13" height="12" rx="2.5"/><path d="m16.5 10.5 4.5-2.5v8l-4.5-2.5"/>',
	link: '<path d="M10 14a4.5 4.5 0 0 0 6.4.4l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.7 1.7"/><path d="M14 10a4.5 4.5 0 0 0-6.4-.4l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.7-1.7"/>',
	external: '<path d="M14 4h6v6"/><path d="M20 4 12 12"/><path d="M19 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5h5.5"/>',
	more: '<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>',
	check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	bell: '<path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z"/><path d="M10 19a2.2 2.2 0 0 0 4 0"/>',
	eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
	clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.5 2"/>',
	arrowUp: '<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>',
	book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.7A1.7 1.7 0 0 0 5 20.2z"/><path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19"/>',
	star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>'
};

const FILLED = new Set(['like', 'save', 'star']);

/**
 * Renders one icon as inline SVG.
 * @param {string} name Icon name from PATHS.
 * @param {string} [cls] Extra CSS classes.
 * @param {boolean} [filled] Force filled rendering.
 */
export function icon(name, cls = '', filled = false) {
	const paths = PATHS[name] || PATHS.spark;
	const isFilled = filled || FILLED.has(name);
	const fill = isFilled ? 'currentColor' : 'none';
	const stroke = isFilled ? 'none' : 'currentColor';
	return `<svg class="feed-ic ${cls}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/** Icon button with full interactive states (styled in feed.css). */
export function iconButton({ icon: name, label, count = null, active = false, disabled = false, extraClass = '' }) {
	const countHtml = count !== null && count !== undefined
		? `<span class="feed-ic-btn-count" aria-hidden="true">${formatCount(count)}</span>` : '';
	return `<button type="button" class="feed-ic-btn ${active ? 'is-active' : ''} ${extraClass}" aria-label="${escapeAttr(label)}"${active ? ' aria-pressed="true"' : ''}${disabled ? ' disabled' : ''}>${icon(name)}<span class="feed-ic-btn-label">${escapeHtml(label)}</span>${countHtml}</button>`;
}

export function formatCount(n) {
	n = Number(n) || 0;
	if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
	if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
	return String(n);
}

export function timeAgo(ts) {
	const t = Number(ts) || 0;
	const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
	if (s < 60) return s + 's';
	const m = Math.floor(s / 60);
	if (m < 60) return m + 'm';
	const h = Math.floor(m / 60);
	if (h < 24) return h + 'h';
	const d = Math.floor(h / 24);
	if (d < 30) return d + 'd';
	const mo = Math.floor(d / 30);
	if (mo < 12) return mo + 'mo';
	return Math.floor(mo / 12) + 'y';
}

export function escapeHtml(s) {
	return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function escapeAttr(s) {
	return escapeHtml(s).replace(/'/g, '&#39;');
}

export const ICON_NAMES = Object.keys(PATHS);
