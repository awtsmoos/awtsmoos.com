// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelWorldBlueprints
 * @description
 * The Awtsmoos composes the optional district console from small visible vessels.
 */
import { DISTRICTS, districtCopy } from './world-data.js';

export function createWorldPanel(actions = {}) {
	return {
		tag: 'section',
		attr: {
			class: 'heichel-os-world-panel',
			'aria-label': 'Heichel operating system districts'
		},
		children: [districtDock(actions), statusGrid(), districtViewport()]
	};
}

function districtDock(actions) {
	return {
		tag: 'div',
		attr: {
			class: 'heichel-os-district-dock',
			'data-heichel-os-world': 'true'
		},
		children: [
			{
				tag: 'div',
				attr: { class: 'heichel-os-world-heading' },
				children: [
					{ tag: 'p', attr: { class: 'hero-kicker' }, children: ['Heichel OS'] },
					{ tag: 'h2', attr: { 'data-heichel-os-name': 'true' }, children: ['Living Heichel'] },
					{ tag: 'p', attr: { 'data-heichel-os-desc': 'true' }, children: ['Live knowledge and graph districts.'] }
				]
			},
			{
				tag: 'div',
				attr: { class: 'heichel-os-district-buttons' },
				children: DISTRICTS.map(([id, label], index) => {
					return districtButton(id, label, index, actions);
				})
			}
		]
	};
}

function districtButton(id, label, index, actions) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: index === 0 ? 'active' : '',
			'data-heichel-district': id
		},
		children: [label],
		events: {
			click: () => actions.activateHeichelDistrict?.(id)
		}
	};
}

function statusGrid() {
	return {
		tag: 'div',
		attr: { class: 'heichel-os-status-grid' },
		children: [
			statusCard('posts', 'Posts'),
			statusCard('series', 'Series'),
			statusCard('mode', 'Access'),
			statusCard('currentSeries', 'Series path')
		]
	};
}

function statusCard(key, label) {
	return {
		tag: 'article',
		attr: { class: 'heichel-os-status-card' },
		children: [
			{ tag: 'strong', attr: { 'data-heichel-os-count': key }, children: ['0'] },
			{ tag: 'small', children: [label] }
		]
	};
}

function districtViewport() {
	return {
		tag: 'article',
		attr: { class: 'heichel-os-district-viewport' },
		children: [
			{ tag: 'h3', attr: { 'data-heichel-district-title': 'true' }, children: ['Overview'] },
			{
				tag: 'div',
				attr: { 'data-heichel-district-body': 'true' },
				children: districtCopy('overview').map(text => ({
					tag: 'p',
					children: [text]
				}))
			}
		]
	};
}
