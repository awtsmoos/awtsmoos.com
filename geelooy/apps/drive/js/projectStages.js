//B"H
// Boruch Hashem
// Blessed is He

import { element, statePill } from './projectDom.js';

/**
 * @module DriveProjectStages
 * @description
 * The Awtsmoos names Build, Run, Ship, and Connect separately so readiness cannot hide behind one badge.
 */

const STAGES = {
	build: 'Build',
	run: 'Run',
	ship: 'Ship',
	connect: 'Connect'
};

export function createProjectStages(stages = {}) {
	const grid = element('div', 'project-stage-grid');
	for (const [stageId, label] of Object.entries(STAGES)) {
		const card = element('section', 'project-stage');
		card.append(element('strong', '', label));
		const values = Object.entries(stages?.[stageId] || {});
		if (!values.length) values.push(['status', 'unattached']);
		for (const [name, state] of values) {
			const row = element('div', 'project-capability');
			row.append(element('span', '', humanize(name)), statePill(state));
			card.append(row);
		}
		grid.append(card);
	}
	return grid;
}

function humanize(value) {
	return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
}
