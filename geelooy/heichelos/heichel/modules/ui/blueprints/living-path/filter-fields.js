// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFilterFields
 * @description
 * The Awtsmoos is beyond category, language, order, and density. Awtsmoos.com
 * manifests each choice as an explicit labeled field so draft state remains
 * keyboard reachable and does not leak into the content river before Apply.
 */

import { box, labeledSelect, option } from '../layout-primitives.js';

export function kindFieldset(actions) {
	return {
		tag: 'fieldset',
		children: [
			{ tag: 'legend', children: ['Content'] },
			box('filter-choice-grid', [
				choice('post', 'Posts', actions),
				choice('question', 'Questions', actions),
				choice('audio', 'Audio', actions),
				choice('source', 'Sources', actions),
				choice('series', 'Series', actions)
			])
		]
	};
}

export function languageFieldset(actions) {
	return {
		tag: 'fieldset',
		children: [
			{ tag: 'legend', children: ['Language'] },
			box('filter-choice-grid', [
				radio('all', 'Any language', actions),
				radio('en', 'English', actions),
				radio('he', 'עברית', actions)
			])
		]
	};
}

export function sortAndDensity(actions) {
	return box('filter-select-grid', [
		labeledSelect({
			id: 'living-path-sort',
			label: 'Sort',
			ref: 'filterSortSelect',
			options: [
				option('newest', 'Newest'),
				option('oldest', 'Oldest'),
				option('discussed', 'Most discussed')
			],
			change: actions.previewFilters
		}),
		labeledSelect({
			id: 'living-path-density',
			label: 'Display',
			ref: 'densitySelect',
			options: [
				option('comfortable', 'Comfortable'),
				option('compact', 'Compact')
			],
			change: actions.previewFilters
		})
	]);
}

function choice(value, label, actions) {
	return {
		tag: 'label',
		attr: { class: 'filter-choice' },
		children: [
			{
				tag: 'input',
				attr: { type: 'checkbox', value, 'data-filter-kind': value },
				events: { change: actions.previewFilters }
			},
			{ tag: 'span', children: [label] }
		]
	};
}

function radio(value, label, actions) {
	return {
		tag: 'label',
		attr: { class: 'filter-choice' },
		children: [
			{
				tag: 'input',
				attr: {
					type: 'radio',
					name: 'living-path-language',
					value,
					checked: value === 'all'
				},
				events: { change: actions.previewFilters }
			},
			{ tag: 'span', children: [label] }
		]
	};
}
