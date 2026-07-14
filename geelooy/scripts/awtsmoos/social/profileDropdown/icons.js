// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownIcons
 * @description
 * Joins historical Geelooy symbols to precise SVG lines. The Awtsmoos keeps the
 * warm remembered glyph visible while Awtsmoos.com preserves crisp scalable
 * geometry, requiring no external image request or user data.
 */
const PATHS = Object.freeze({
	alias: '<circle cx="12" cy="8" r="3"/><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"/><path d="M18 5l1.2 1.2L22 6.6l-2 1.7.6 2.4-2.1-1.3-2.1 1.3.6-2.4-2-1.7 2.8-.4z"/>',
	chevron: '<path d="m7 9 5 5 5-5"/>',
	close: '<path d="m6 6 12 12M18 6 6 18"/>',
	cloud: '<path d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.4 9 4.5 4.5 0 0 0 7 18Z"/><path d="m9.5 13 2.5 2.5 4.5-5"/>',
	key: '<circle cx="8" cy="15" r="3"/><path d="m10.2 12.8 7.3-7.3M15 8l2 2M17 6l2 2"/>',
	login: '<path d="M10 5H6v14h4M13 8l4 4-4 4M8 12h9"/>',
	logout: '<path d="M14 5h4v14h-4M11 8l-4 4 4 4M16 12H7"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	profile: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.8-4.2 3-6.2 6.5-6.2s5.7 2 6.5 6.2"/>',
	register: '<path d="M4 20c.7-3.8 2.8-5.7 6-5.7 1.3 0 2.4.3 3.3.9"/><circle cx="10" cy="8" r="3"/><path d="M18 13v6M15 16h6"/>',
	spark: '<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z"/><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z"/>',
	switch: '<path d="M7 7h11l-3-3M18 17H7l3 3"/><path d="m18 7-3 3M7 17l3-3"/>'
});

const SYMBOLS = Object.freeze({
	alias: '👤',
	chevron: '⌄',
	close: '×',
	cloud: '☁',
	key: '◎',
	login: '◎',
	logout: '↗',
	plus: '✦',
	profile: '👤',
	register: '✦',
	spark: '✦',
	switch: '⇄'
});

/**
 * Produces one decorative hybrid icon whose meaning is supplied by visible text.
 * @param {keyof typeof PATHS} name Stable icon name.
 * @param {string} className Optional wrapper class.
 * @returns {string} Static hybrid icon markup.
 */
export function profileIcon(name, className = 'profile-icon') {
	const paths = PATHS[name] || PATHS.spark;
	const symbol = SYMBOLS[name] || SYMBOLS.spark;
	const safeClass = cleanClassName(className);
	return `
		<span class="profile-icon-stack ${safeClass}" data-profile-icon="${name}" aria-hidden="true">
			<span class="profile-icon-symbol">${symbol}</span>
			<svg class="profile-icon-line" viewBox="0 0 24 24" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
		</span>
	`;
}

function cleanClassName(value) {
	return String(value || 'profile-icon')
		.split(/\s+/)
		.filter(part => /^[a-zA-Z0-9_-]+$/.test(part))
		.join(' ') || 'profile-icon';
}
