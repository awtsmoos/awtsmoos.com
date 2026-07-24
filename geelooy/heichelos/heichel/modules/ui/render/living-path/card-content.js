// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardContent
 * @description
 * The Awtsmoos creates title, description, media, and counts before any card.
 * Awtsmoos.com composes those visible fragments in one shared language so the
 * Timeline, Tree, and Groupings remain distinct without duplicating content rules.
 */

export function mediaBlueprint(data) {
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
	return {
		tag: 'div',
		attr: { class: 'nav-card-body' },
		children: [
			{ tag: 'p', attr: { class: 'nav-card-kicker' }, children: [kindLabel(data)] },
			{ tag: 'h3', children: [data.title] },
			{
				tag: 'p',
				attr: { class: 'nav-card-description' },
				children: [description(data)]
			},
			{
				tag: 'footer',
				attr: { class: 'nav-card-meta' },
				children: metaBlueprints(data)
			}
		]
	};
}

function metaBlueprints(data) {
	const values = data.type === 'post'
		? [unit(data.sectionsCount, 'section'), unit(data.commentsCount, 'comment')]
		: [unit(data.subSeriesCount, 'sub-series'), unit(data.postCount, 'post')];
	return values.map(value => ({ tag: 'span', children: [value] }));
}

function description(data) {
	if (data.description) return data.description;
	return data.type === 'post'
		? 'Open this teaching in the reader.'
		: 'Open this branch or expand its children.';
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

function unit(value, noun) {
	return `${value} ${value === 1 ? noun : `${noun}s`}`;
}
