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
	filter: '<path d="M4 5.5h16l-6.2 7.2v5.1l-3.6 2v-7.1z"/>',
	star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
	/* B"H — Q&A icon set (Yaakov 2026-10-13): fancy Torah-styled question marks,
	   answered checkmarks, voting pennants. Sharp corners only. */
	question: '<path d="M10.2 6.8C9 5.2 10.2 3 12.9 3c2.9 0 5.1 2 5.1 4.8 0 2.9-2.7 3.9-4.1 5.8-.9 1.3-1.3 2.5-1.3 4.1"/><path d="M12.6 19.4l1.7 1.7-1.7 1.7-1.7-1.7z" fill="currentColor" stroke="none"/><path d="M4.6 3.4v3M3.1 4.9h3"/>',
	questionCircle: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/><path d="M11.8 9c-.5-.8.1-1.8 1.4-1.8 1.5 0 2.6 1 2.6 2.4 0 1.5-1.4 2-2.1 3-.5.6-.7 1.2-.7 2.1"/><path d="M12.8 16.3l.9.9-.9.9-.9-.9z"/>',
	answered: '<path d="M9 14.5l2.6 2.6 4.4-5.2"/><path d="M3.5 20.5 6.5 9"/><path d="M4.1 17.5 2.2 17M4.7 15 2.9 14.2M5.3 12.5 3.7 11.4"/><path d="M20.5 20.5 17.5 9"/><path d="M19.9 17.5l1.9-.5M19.3 15l1.8-.8M18.7 12.5l1.6-1.1"/>',
	unanswered: '<path d="M10.2 6.8C9 5.2 10.2 3 12.9 3c2.9 0 5.1 2 5.1 4.8 0 2.9-2.7 3.9-4.1 5.8-.9 1.3-1.3 2.5-1.3 4.1"/><path d="M12.6 19.4l1.7 1.7-1.7 1.7-1.7-1.7z"/>',
	upvote: '<path d="M12 3.5 19.5 13.5h-4.8v7H9.3v-7H4.5z"/>',
	downvote: '<path d="M12 20.5 4.5 10.5h4.8v-7h5.4v7h4.8z"/>',
	/* B"H — learning-track icons (Yaakov 2026-10-13): shiur mode, source
	   sheets, siyum flags, learning plans, community challenges. Sharp
	   corners only, drawn to the same 24px stroke language. */
	present: '<rect x="3.5" y="4.5" width="17" height="11"/><path d="M12 15.5v3.5M8.5 21.5h7"/><path d="M8 8.5l2.5 2.5 4.5-4.5"/>',
	sheet: '<path d="M6 3.5h8.5L19 8v12.5H6z"/><path d="M14 3.5V8.5h5"/><path d="M8.5 12.5h7M8.5 15.5h7M8.5 18.5h4.5"/>',
	trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H4.5v1a3.5 3.5 0 0 0 3.7 3.5M16 5.5h3.5v1a3.5 3.5 0 0 1-3.7 3.5"/><path d="M12 13.5v4M8.5 20.5h7M10 17.5h4"/>',
	flag: '<path d="M5.5 21.5v-17"/><path d="M5.5 5c4-2.5 7.5 2.5 11.5 0v9c-4 2.5-7.5-2.5-11.5 0"/>',
	calendar: '<rect x="4" y="5.5" width="16" height="15"/><path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5"/><path d="M8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17h.01M12 17h.01M15.5 17h.01"/>',
	target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
	party: '<path d="M5 15 15 5l2 2L7 17z"/><path d="M5 15l-1.5 5.5L9 19"/><path d="M16 4.5l.8-2M18.5 6l2-.5M19 9l1.8.8"/>',
	/* B"H — language globe (Yaakov 2026-10-13, TRACK E): the feed's UI
	   chrome speaks six languages; the switcher gets its own globe. */
	globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c-5.2 5.2-5.2 11.8 0 17"/><path d="M12 3.5c5.2 5.2 5.2 11.8 0 17"/>',
	acceptedAnswer: '<path d="M5 8 4.2 4l3.8 2.3L12 2.8l3.9 3.5L19.8 4 19 8z"/><path d="M7.5 14.5l3.5 3.5L17.5 11"/>',
	ask: '<path d="M4 18.5C6.5 12.5 10.5 8 17 5 16 11.5 11.5 17 4 18.5z"/><path d="M4 18.5 17 5"/><path d="M18.3 15c-.3-.5.1-1.1 1-1.1 1 0 1.7.6 1.7 1.5 0 1-.9 1.3-1.3 1.9-.3.4-.4.8-.4 1.3"/><path d="M19.3 19.9l.8.8-.8.8-.8-.8z"/>',
	/* B"H — TRACK A (Yaakov 2026-10-14): collections folder, print, audio icons. Sharp corners only. */
	folder: '<path d="M3.5 6.5a1 1 0 0 1 1-1h5l2 2.5h7a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1z"/>',
	printer: '<path d="M7 8V3.5h10V8"/><rect x="4" y="8" width="16" height="8"/><path d="M7 13.5h10v7H7z"/>',
	play: '<path d="M8 5.5v13l10-6.5z"/>',
	pause: '<path d="M8 5.5v13M16 5.5v13"/>',
	stop: '<rect x="7" y="7" width="10" height="10"/>',
	speaker: '<path d="M4 9.5v5h4l5 4v-13l-5 4z"/><path d="M16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'
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

/** Icon button with full interactive states (styled in feed.css).
 * `act` is a stable machine action key ("save", "comment", "share") — the
 * click handler must read data-act, never the translated visible label. */
export function iconButton({ icon: name, label, count = null, active = false, disabled = false, extraClass = '', act = '' }) {
	const countHtml = count !== null && count !== undefined
		? `<span class="feed-ic-btn-count" aria-hidden="true">${formatCount(count)}</span>` : '';
	return `<button type="button" class="feed-ic-btn ${active ? 'is-active' : ''} ${extraClass}"${act ? ` data-act="${escapeAttr(act)}"` : ''} aria-label="${escapeAttr(label)}"${active ? ' aria-pressed="true"' : ''}${disabled ? ' disabled' : ''}>${icon(name)}<span class="feed-ic-btn-label">${escapeHtml(label)}</span>${countHtml}</button>`;
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
