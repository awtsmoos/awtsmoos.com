// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathCardContent
 * @description
 * The Awtsmoos gives Torah destinations only the visible information they truly
 * possess. Awtsmoos.com omits fabricated branch artwork and repetitive branch
 * filler while preserving genuine thumbnails, teaching kinds, and truthful counts.
 */

import { translationBadge } from '../../../living-path/translation-context.js';

/** Builds media only when it communicates something real. */
export function mediaBlueprint(data) {
	const isBranch = ['series', 'grouping'].includes(data.type);
	if (isBranch && !data.thumbnail) return null;
	return {
		tag: 'div',
		attr: {
			class: `nav-card-media ${data.thumbnail ? 'has-thumbnail' : ''}`.trim(),
			style: data.thumbnail ? { backgroundImage: `url("${data.thumbnail}")` } : {},
			'aria-hidden': 'true'
		},
		children: data.thumbnail && isBranch
			? []
			: [{ tag: 'span', children: [symbol(data)] }]
	};
}

/** Builds learner-first card copy without redundant branch category labels. */
export function bodyBlueprint(data) {
	return {
		tag: 'div',
		attr: { class: 'nav-card-body' },
		children: [
			kickerBlueprint(data),
			{ tag: 'h3', children: [data.title] },
			descriptionBlueprint(data),
			{ tag: 'footer', attr: { class: 'nav-card-meta' }, children: metaBlueprints(data) }
		].filter(Boolean)
	};
}

/** Keeps branch cards quiet while teachings retain useful media-kind context. */
function kickerBlueprint(data) {
	if (['series', 'grouping'].includes(data.type)) return null;
	return { tag: 'p', attr: { class: 'nav-card-kicker' }, children: [kindLabel(data)] };
}

/** Shows real branch descriptions and one clear fallback only for readable teachings. */
function descriptionBlueprint(data) {
	const text = data.description || (data.type === 'post' ? 'Open this teaching in the reader.' : '');
	if (!text) return null;
	return { tag: 'p', attr: { class: 'nav-card-description' }, children: [text] };
}

/** Returns only non-zero counts and real translation state. */
function metaBlueprints(data) {
	const values = data.type === 'post'
		? [unit(data.sectionsCount, 'section'), unit(data.commentsCount, 'comment')]
		: [unit(data.subSeriesCount, 'sub-series', 'sub-series'), unit(data.postCount, 'teaching')];
	const items = values.filter(Boolean).map(value => ({ tag: 'span', children: [value] }));
	const badge = translationBadge(data.translationStatus);
	if (data.type === 'post' && badge) {
		items.push({
			tag: 'span',
			attr: { class: `nav-card-translation-badge is-${badge.tone}` },
			children: [badge.label]
		});
	}
	return items;
}

/** Supplies compact fallback glyphs only for non-thumbnail teaching media. */
function symbol(data) {
	if (data.kind === 'audio') return '◖';
	if (data.kind === 'question') return '?';
	return data.type === 'post' ? 'P' : 'S';
}

/** Maps stable source kinds to learner-facing teaching vocabulary. */
function kindLabel(data) {
	const labels = {
		post: 'Teaching', question: 'Question', audio: 'Audio', source: 'Source'
	};
	return labels[data.kind] || labels[data.type] || 'Teaching';
}

/** Formats a positive finite count and otherwise suppresses the counter. */
function unit(value, singular, plural = `${singular}s`) {
	const count = Number(value);
	if (!Number.isFinite(count) || count <= 0) return null;
	return `${count} ${count === 1 ? singular : plural}`;
}
