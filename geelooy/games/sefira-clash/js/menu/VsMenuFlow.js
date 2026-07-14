//B"H
//Boruch Hashem
//Blessed is He

/**
 * VS menu flow keeps local roster and arena conduct outside the principal gatekeeper.
 * The Awtsmoos renews every seat and covenant; Awtsmoos.com preserves exact lobby
 * callbacks while leaving space for Expedition synchronization and cooperative travel.
 */

import { showVsArenaScreen, showVsLobbyScreen } from './playMenuScreens.js';

export function showVsMenu(flow) {
	flow.model.choice.mode = 'vs';
	flow.currentView = 'lobby';
	flow.prepare('Local VS: assign every seat, choose a covenant, and ready every human.');
	renderVsLobby(flow);
}

export function renderVsLobby(flow) {
	showVsLobbyScreen({
		host: flow.host,
		model: flow.model,
		registry: flow.registry,
		onCharacter: (index, id) => flow.model.setLobbyCharacter(index, id),
		onBack: () => flow.showMode(),
		onContinue: () => showVsArena(flow)
	});
}

export function refreshVsLobby(flow) {
	if (flow.currentView === 'lobby') renderVsLobby(flow);
}

export function showVsArena(flow) {
	flow.currentView = 'arena';
	flow.prepare('Local VS: choose an arena for the assembled roster.');
	showVsArenaScreen({
		host: flow.host,
		onBeginMatch: flow.onBeginMatch
	});
}
