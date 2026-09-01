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
		return { aria: 'Chapter navigation', next: 'Next', previous: 'Previous', status: 'Chapter', target: `Chapter ${index + 1}` };
	}
	const words = chitasNavigationWords();
	return { ...words, target: chitasDayLabel(index) };
}

function gate(series, id, label, index, direction) {
	const copy = navigationCopy(series, index);
	return {
		tag: 'a',
		attr: {
			id,
			class: `awtsmoos-chapter-gate awtsmoos-chapter-gate-${direction}`,
			href: targetHref(series, index),
			'data-target-chapter': String(index),
			'aria-label': `${label}: ${copy.target}`
		},
		children: [
			{ tag: 'span', attr: { class: 'awtsmoos-chapter-gate-arrow' }, text: direction === 'previous' ? '←' : '→' },
			{ tag: 'span', attr: { class: 'awtsmoos-chapter-gate-label' }, text: label },
			{ tag: 'span', attr: { class: 'awtsmoos-chapter-gate-number' }, text: copy.target }
		]
	};
}

export function makeNavBars(post, series, indexInSeries) {
	if (!series || !Array.isArray(series.posts)) return document.createTextNode('');
	const currentIndex = Number.parseInt(indexInSeries, 10) || 0;
	const length = series.posts.length;
	const copy = navigationCopy(series, currentIndex);
	const plan = {
		tag: 'nav',
		attr: { class: 'awtsmoos-chapter-nav', 'aria-label': copy.aria },
		children: [{
			tag: 'div',
			attr: { class: 'awtsmoos-chapter-nav-status' },
			children: [{ tag: 'span', text: copy.status }, { tag: 'strong', text: copy.target }, { tag: 'span', text: `${currentIndex + 1} / ${length}` }]
		}]
	};
	if (currentIndex > 0) plan.children.push(gate(series, 'last', navigationCopy(series, currentIndex).previous, currentIndex - 1, 'previous'));
	if (currentIndex < length - 1) plan.children.push(gate(series, 'next', navigationCopy(series, currentIndex).next, currentIndex + 1, 'next'));
	return GenesisEngine.manifest(plan);
}
