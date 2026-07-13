// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../quests.js';

function showTemporary(sendUIUpdate, text) {
	sendUIUpdate({ dialogue: { active: true, text } });
	setTimeout(() => sendUIUpdate({ dialogue: { active: false } }), 1500);
}

export function handleFarming(state, soil, sendUIUpdate, trigger) {
	if (soil.state === 'empty') {
		const seedIndex = state.player.inventory.findIndex(item => item.id === 'wheat_seeds');
		if (seedIndex < 0) {
			showTemporary(sendUIUpdate, 'This soil is fertile, but you have no seeds.');
			return;
		}
		state.player.inventory.splice(seedIndex, 1);
		Object.assign(soil, { state: 'planted', growth: 0, emoji: '🌱' });
		Quests.emit(state, { type: 'plant_crop', targetId: 'wheat', mapId: state.currentMapId }, trigger.sendToast);
		showTemporary(sendUIUpdate, 'You planted Wheat Seeds. Rain and time will help them grow.');
		return;
	}
	if (soil.state === 'planted') {
		showTemporary(sendUIUpdate, 'The crops are growing. Patience is part of the craft.');
		return;
	}
	Object.assign(soil, { state: 'empty', growth: 0, emoji: '🟫' });
	Quests.giveItem(state, 'wheat_bundle', 1, trigger.sendToast);
	Quests.emit(state, { type: 'harvest_crop', targetId: 'wheat', mapId: state.currentMapId }, trigger.sendToast);
	showTemporary(sendUIUpdate, 'You harvested the Wheat.');
}
