// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NavigationFooter
 * @description
 * The Awtsmoos preserves each canonical post gate while letting Chitas days speak in their own tongue;
 * Awtsmoos.com keeps chapter navigation unchanged, yet Sunday through Shabbos now name the path along.
 */

import { GenesisEngine } from '../dom/GenesisEngine.js';
import {
	chitasDateFromPostId,
	chitasDayLabel,
	chitasNavigationWords,
	isChitasNavigation
} from './chitasNav.js?v=native-chitas-nav-001';

function queryForTarget(series, targetIndex) {
	const parameters = new URLSearchParams(location.search);
	['idx', 'sub', 'verse', 'verseIndex', 'section', 'sectionIndex', 'paragraph', 'para']
		.forEach(key => parameters.delete(key));
	if (isChitasNavigation(series)) {
		const date = chitasDateFromPostId(series.posts?.[targetIndex]);
		if (date) parameters.set('chitasDate', date);
	}
	const serialized = parameters.toString();
	return serialized ? `?${serialized}` : '';
}

function readerIdentity(series) {
	const parts = location.pathname.split('/').filter(Boolean).map(decodeURIComponent);
	const heichelMarker = parts.indexOf('heichelos');
	const seriesMarker = parts.indexOf('series');
	return {
		heichelId: window.heichelId || parts[heichelMarker + 1] || '',
		seriesId: series?.id || window.series?.id || window.post?.parentSeriesId || parts[seriesMarker + 1] || 'root'
	};
}

function targetHref(series, targetIndex) {
	const postId = Array.isArray(series?.posts) ? series.posts[targetIndex] : '';
	if (!postId) return '#';
	const { heichelId, seriesId } = readerIdentity(series);
	return `/heichelos/${encodeURIComponent(heichelId)}`
		+ `/series/${encodeURIComponent(seriesId)}`
		+ `/post/${encodeURIComponent(postId)}`
		+ queryForTarget(series, targetIndex);
}

function navigationCopy(series, index) {
	if (!isChitasNavigation(series)) {
		return { aria: 'Chapter navigation', next: 'Next', previous: 'Previous', status: 'Chapter', target: String(index + 1) };
	}
	const words = chitasNavigationWords();
	return { ...words, target: chitasDayLabel(index) };
}

/**
 * B"H — resolves the current post's index in the series robustly.
 * The URL often carries a post ID (not a numeric index); parseInt on a post
 * ID yields NaN, which previously collapsed to 0 and produced wrong prev/next
 * chapter numbers. Match the actual post ID first, fall back to the numeric
 * index only when it parses cleanly.
 */
function resolveCurrentIndex(post, series, indexInSeries) {
	const postId = post?.id || post?.postId
		|| (typeof window !== 'undefined' && (window.post?.id || window.post?.postId));
	if (postId && Array.isArray(series?.posts)) {
		const found = series.posts.indexOf(postId);
		if (found >= 0) return found;
		const foundObj = series.posts.findIndex(p => p === postId || p?.id === postId || p?.postId === postId);
		if (foundObj >= 0) return foundObj;
	}
	const parsed = Number.parseInt(indexInSeries, 10);
	if (Number.isFinite(parsed) && parsed >= 0) return parsed;
	return 0;
}

/** Renders one prev/next gate with real spacing, e.g. "← Previous · Chapter 10". */
function gate(series, id, label, index, direction) {
	const copy = navigationCopy(series, index);
	const targetName = isChitasNavigation(series) ? copy.target : `Chapter ${copy.target}`;
	const arrow = {
		tag: 'span',
		attr: { class: 'awtsmoos-chapter-gate-arrow' },
		text: direction === 'previous' ? '← ' : ' →'
	};
	const words = [
		{ tag: 'span', attr: { class: 'awtsmoos-chapter-gate-label' }, text: label },
		{ tag: 'span', attr: { class: 'awtsmoos-chapter-gate-number' }, text: ` · ${targetName}` }
	];
	return {
		tag: 'a',
		attr: {
			id,
			class: `awtsmoos-chapter-gate awtsmoos-chapter-gate-${direction}`,
			href: targetHref(series, index),
			'data-target-chapter': String(index),
			'aria-label': `${label}: ${targetName}`
		},
		children: direction === 'previous' ? [arrow, ...words] : [...words, arrow]
	};
}

/** Renders the status line with real spacing, e.g. "Chapter 11 of 26". */
function statusChildren(series, currentIndex, length) {
	const copy = navigationCopy(series, currentIndex);
	if (isChitasNavigation(series)) {
		return [{ tag: 'span', text: `${copy.status}: ${copy.target} · ${currentIndex + 1} of ${length}` }];
	}
	return [{ tag: 'span', text: `${copy.status} ${copy.target} of ${length}` }];
}

export function makeNavBars(post, series, indexInSeries) {
	if (!series || !Array.isArray(series.posts)) return document.createTextNode('');
	const length = series.posts.length;
	// B"H — a series whose post list is unavailable (e.g. a packed-only
	// series whose details route cannot enumerate its posts yet) has no
	// truthful chapter count: render no nav rather than a false
	// "Chapter 1 of 0" status.
	if (!length) return document.createTextNode('');
	const currentIndex = resolveCurrentIndex(post, series, indexInSeries);
	const copy = navigationCopy(series, currentIndex);
	const plan = {
		tag: 'nav',
		attr: { class: 'awtsmoos-chapter-nav', 'aria-label': copy.aria },
		children: [{
			tag: 'div',
			attr: { class: 'awtsmoos-chapter-nav-status' },
			children: statusChildren(series, currentIndex, length)
		}]
	};
	if (currentIndex > 0) plan.children.push(gate(series, 'last', navigationCopy(series, currentIndex).previous, currentIndex - 1, 'previous'));
	if (currentIndex < length - 1) plan.children.push(gate(series, 'next', navigationCopy(series, currentIndex).next, currentIndex + 1, 'next'));
	return GenesisEngine.manifest(plan);
}
