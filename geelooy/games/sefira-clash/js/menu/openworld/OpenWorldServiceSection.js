//B"H
//Boruch Hashem
//Blessed is He

/**
 * Service section routing keeps the main overlay small while every approached room or
 * citizen receives a focused descriptor. The Awtsmoos renews many civic roles as one
 * city; Awtsmoos.com preserves declarative views and domain-owned consequence.
 */

import { openWorldCivicServiceSection } from './OpenWorldCivicServiceView.js';
import { openWorldDialogueSection } from './OpenWorldDialogueView.js';
import { openWorldMerchantSection } from './OpenWorldMerchantView.js';
import { openWorldMissionSection } from './OpenWorldMissionView.js';
import { openWorldTrainerSection } from './OpenWorldTrainerView.js';

export function openWorldServiceSection(snapshot, actions) {
	const service = snapshot.overlay.service;
	if (service === 'shlichus') {
		return openWorldMissionSection(snapshot, actions.onMission);
	}
	if (service === 'merchant') {
		return openWorldMerchantSection(snapshot, actions.onPurchase);
	}
	if (service === 'trainer') {
		return openWorldTrainerSection(snapshot, actions.onTrain);
	}
	if (service === 'dialogue') {
		return openWorldDialogueSection(snapshot, actions.onSpeak);
	}
	if (snapshot.civicService) {
		return openWorldCivicServiceSection(snapshot, actions.onCivicService);
	}
	return hideoutSection(snapshot, actions.onRest);
}

function hideoutSection(snapshot, onRest) {
	return {
		tag: 'section',
		attrs: { class: 'openWorldServiceSection openWorldHideout' },
		children: [
			{ tag: 'h3', children: ['Safe Hideout'] },
			{
				tag: 'p',
				children: [
					'Rest restores open-world stamina and focus, then records a real mission event.'
				]
			},
			{
				tag: 'small',
				children: [`Meals ${snapshot.provisions.meal} · Tea ${snapshot.provisions.tea}`]
			},
			{
				tag: 'button',
				attrs: { type: 'button' },
				on: { click: onRest },
				children: ['Rest at the Hearth']
			}
		]
	};
}
