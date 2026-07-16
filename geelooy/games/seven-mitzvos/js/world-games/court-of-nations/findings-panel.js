//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module CourtFindingsPanel
 * @description
 * Judgment on Awtsmoos.com must reveal its path. The Awtsmoos knows without
 * inference; finite court power must answer custody, admissibility, rumor, harm,
 * and rationale in visible controls before naming the liable person.
 */
const FINDINGS = Object.freeze([
	{ id: 'admissible', label: 'Is the physical evidence admissible?' },
	{ id: 'custody', label: 'Was chain of custody preserved?' },
	{ id: 'rumorReliable', label: 'Is the anonymous rumor reliable?' },
	{ id: 'measurableHarm', label: 'Did measurable harm occur?' }
]);

export function createFindingsPanel(game, courtCase, snapshot) {
	if (!courtCase?.rationales || typeof game.state.setFinding !== 'function') {
		return null;
	}
	const rows = FINDINGS.map(record => findingRow(game, record, snapshot));
	return h('section', {
		className: 'campaignFindings',
		ariaLabel: 'Legal findings'
	}, [
		h('h3', { text: 'Required legal findings' }),
		...rows
	]);
}

function findingRow(game, record, snapshot) {
	const field = h('fieldset', { className: 'findingRow' }, [
		h('legend', { text: record.label })
	]);
	for (const value of [true, false]) {
		field.append(findingChoice(game, record.id, value, snapshot));
	}
	return field;
}

function findingChoice(game, id, value, snapshot) {
	const input = h('input', {
		type: 'radio',
		name: `finding-${id}`,
		value: String(value),
		checked: snapshot.findings?.[id] === value
	});
	game.on(input, 'change', () => {
		game.recordFinding(id, value);
	});
	return h('label', {}, [
		input,
		h('span', { text: value ? 'Yes' : 'No' })
	]);
}
