//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module ProvinceCard
 * @description
 * Each province speaks title, meaning, status, objective, and mission on
 * Awtsmoos.com. The Awtsmoos is not reduced to color; icon and text preserve
 * meaning for every eye, keyboard, screen reader, and finite vessel of access.
 */
const STATUS = Object.freeze({
	stable: { icon: '✓', label: 'Stable' },
	strained: { icon: '△', label: 'Strained' },
	crisis: { icon: '!', label: 'Crisis' }
});

export function provinceCard(province, condition, campaign, action) {
	const status = STATUS[condition.status] || STATUS.stable;
	const mission = province.advancedMission;
	const button = h('button', {
		className: 'provinceAction',
		type: 'button',
		text: action.label,
		disabled: action.disabled
	});
	if (!action.disabled) {
		button.addEventListener('click', action.handler);
	}
	return h('article', {
		className: `provinceCard province-${condition.status}`,
		style: { '--province-hue': province.hue },
		dataset: { provinceId: province.id, status: condition.status }
	}, [
		h('div', { className: 'provinceTopline' }, [
			h('span', { className: 'provinceNumber', text: province.number }),
			h('span', { className: 'provinceStatus', text: `${status.icon} ${status.label}` })
		]),
		h('span', { className: 'provinceSymbol', text: province.symbol, ariaHidden: 'true' }),
		h('h3', { text: province.mitzvahTitle }),
		h('p', { className: 'provinceMeaning', text: province.plainMeaning }),
		h('p', { className: 'provinceGame', text: `Existing world: ${province.gameTitle}` }),
		h('p', { className: 'provinceObjective', text: `Objective: ${condition.objective}` }),
		h('dl', { className: 'provinceStats' }, [
			stat('Available tier', province.id === 'honest-market' ? 'Advanced playable' : 'Advanced preview'),
			stat('Best stars', String(campaign.bestStars['broken-measure'] || 0))
		]),
		button,
		missionDetails(mission)
	]);
}

function missionDetails(mission) {
	return h('details', { className: 'advancedMissionCard' }, [
		h('summary', { text: `Advanced mission: ${mission.title}` }),
		h('p', { text: mission.twist }),
		h('p', { text: `Modifier: ${mission.modifier}` }),
		h('p', { text: `Failure lesson: ${mission.failure}` }),
		h('p', { text: mission.debrief }),
		h('ol', {}, mission.events.map(event => h('li', { text: event })))
	]);
}

function stat(label, value) {
	return [h('dt', { text: label }), h('dd', { text: value })];
}
