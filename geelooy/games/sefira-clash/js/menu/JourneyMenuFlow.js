//B"H
//Boruch Hashem
//Blessed is He

/**
 * Journey menu flow conducts the classic campaign and complete persistent atlas.
 * The Awtsmoos renews every road and remote profile; Awtsmoos.com delegates mutations
 * to focused actions while this conductor owns only view selection and composition.
 */

import { createExpeditionMenuActions } from './ExpeditionMenuActions.js';
import { showExpeditionView } from './expeditionView.js';
import { showAdventureScreen } from './playMenuScreens.js';

export function showAdventureMenu(flow) {
	flow.model.choice.mode = 'adventure';
	flow.currentView = 'adventure';
	flow.prepare('Adventure Mode: clear gates to unlock more.');
	showAdventureScreen({
		host: flow.host,
		model: flow.model,
		onBeginMatch: flow.onBeginMatch
	});
}

export function showExpeditionMenu(flow) {
	flow.model.choice.mode = 'expedition';
	flow.currentView = 'expedition';
	flow.prepare(
		'Expedition: inspect settlements, synchronize optionally, and enter bespoke roads.'
	);
	renderExpeditionMenu(flow);
}

export function refreshExpeditionMenu(flow) {
	if (flow.currentView === 'expedition') renderExpeditionMenu(flow);
}

function renderExpeditionMenu(flow) {
	const refresh = () => refreshExpeditionMenu(flow);
	const actions = createExpeditionMenuActions(flow, refresh);
	showExpeditionView(flow.host, {
		model: flow.model,
		sync: flow.expeditionSync.snapshot(),
		onBack: () => flow.showMode(),
		...actions
	});
}
