// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutDistricts
 * @description
 * Heichel OS district navigation and its status viewport remain one focused vessel.
 */

import {
	box,
	button
} from './layout-primitives.js';

const DISTRICTS = [
	'Overview',
	'Timeline',
	'Knowledge',
	'People',
	'Assets',
	'Events',
	'Moderation',
	'Graph',
	'Storage'
];

export function heichelWorldPanel(actions) {
	return {
		tag: 'section',
		attr: {
			class: 'heichel-os-world-panel',
			'aria-label': 'Heichel OS district'
		},
		ref: 'heichelWorldPanel',
		children: [
			districtButtons(actions),
			box(
				'heichel-os-status-grid',
				[],
				{ ref: 'heichelWorldStatusGrid' }
			),
			box(
				'heichel-os-district-viewport',
				[],
				{ ref: 'heichelWorldViewport' }
			)
		]
	};
}

function districtButtons(actions) {
	return box(
		'heichel-os-district-buttons',
		DISTRICTS.map(name => button(
			name,
			`Open ${name} district`,
			() => actions.activateDistrict?.(name)
		))
	);
}

export {
	DISTRICTS
};
