// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ResultSourceActions
 * @description
 * The Awtsmoos gives every search preview three honest doors back into its source;
 * Awtsmoos.com preserves exact reader coordinates while letting the seeker read here, open anew, or reveal insights.
 */

function present(value) {
	return value !== '' && value !== null && value !== undefined;
}

/**
 * @param {string} destination Base source destination.
 * @param {{idx?:unknown,sub?:unknown,comments?:boolean}} state Reader state.
 * @returns {string} Same-origin source path with exact reader state.
 */
export function sourceDestination(destination, {
	idx = null,
	sub = null,
	comments = false
} = {}) {
	if (!destination) return '';
	const url = new URL(destination, 'https://awtsmoos.com');
	if (present(idx)) url.searchParams.set('idx', String(idx));
	if (present(sub)) url.searchParams.set('sub', String(sub));
	if (comments) url.searchParams.set('comments', '1');
	return `${url.pathname}${url.search}${url.hash}`;
}

function sourceLink({ href, text, title, newTab = false }) {
	const link = document.createElement('a');
	link.className = 'resultOpenLink';
	link.href = href;
	link.textContent = text;
	link.setAttribute('aria-label', title);
	if (newTab) {
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
	}
	return link;
}

/**
 * @param {HTMLElement} container Action container.
 * @param {{destination:string,idx?:unknown,sub?:unknown,label?:string}} options Source coordinates.
 * @returns {void}
 */
export function appendSourceActions(container, {
	destination,
	idx = null,
	sub = null,
	label = 'source'
}) {
	if (!container || !destination) return;
	const exact = sourceDestination(destination, { idx, sub });
	const insights = sourceDestination(destination, { idx, sub, comments: true });
	container.hidden = false;
	container.append(
		sourceLink({ href: exact, text: 'Read here', title: `Open ${label} at this match` }),
		sourceLink({ href: exact, text: 'New tab ↗', title: `Open ${label} at this match in a new tab`, newTab: true }),
		sourceLink({ href: insights, text: 'Open with insights', title: `Open ${label} at this match with comments visible` })
	);
}
