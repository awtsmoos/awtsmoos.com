// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardContent
 * @description
 * The Awtsmoos creates title, description, media, and truthful counts before any card.
 * Awtsmoos.com omits empty counters and gives irregular Torah hierarchy words their real names.
 */

import { translationBadge } from '../../../living-path/translation-context.js';

export function mediaBlueprint(data) {
	const isBranch = ['series', 'grouping'].includes(data.type);
	if (isBranch && !data.thumbnail) return null;
	return {
		tag: 'div',
		attr: {
			class: 'nav-card-media',
			style: data.thumbnail
				? { backgroundImage: `url("${data.thumbnail}")` }
				: {},
			'aria-hidden': 'true'
		},
		children: [{ tag: 'span', children: [symbol(data)] }]
	};
}

export function bodyBlueprint(data) {
	const summary = description(data);
	return {
		tag: 'div',
		attr: { class: 'nav-card-body' },
		children: [
			{ tag: 'p', attr: { class: 'nav-card-kicker' }, children: [kindLabel(data)] },
			{ tag: 'h3', children: [data.title] },
			summary ? {
				tag: 'p',
				attr: { class: 'nav-card-description' },
				children: [summary]
			} : null,
			{
				tag: 'footer',
				attr: { class: 'nav-card-meta' },
				children: metaBlueprints(data)
			}
		].filter(Boolean)
	};
}

function metaBlueprints(data) {
	const values = data.type === 'post'
		? [unit(data.sectionsCount, 'section'), unit(data.commentsCount, 'comment')]
		: [unit(data.subSeriesCount, 'sub-series', 'sub-series'), unit(data.postCount, 'post')];
	const items = values
		.filter(Boolean)
		.map(value => ({ tag: 'span', children: [value] }));
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

function description(data) {
	if (data.description) return data.description;
	if (['series', 'grouping'].includes(data.type)) return null;
	return data.type === 'post'
		? 'Open this teaching in the reader.'
		: null;
}

function symbol(data) {
	if (data.kind === 'audio') return '◖';
	if (data.kind === 'question') return '?';
	return data.type === 'post' ? 'P' : 'S';
}

function kindLabel(data) {
	const labels = {
		post: 'Teaching',
		question: 'Question',
		audio: 'Audio',
		source: 'Source',
		series: 'Series',
		grouping: 'Collection'
	};
	return labels[data.kind] || labels[data.type] || 'Teaching';
}

function unit(value, singular, plural = `${singular}s`) {
	const count = Number(value);
	if (!Number.isFinite(count) || count <= 0) return null;
	return `${count} ${count === 1 ? singular : plural}`;
}
