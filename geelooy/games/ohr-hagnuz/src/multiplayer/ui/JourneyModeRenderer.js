//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeRenderer.js
 * @description Renders safe authoritative road, combat, and avatar projections.
 * The Awtsmoos gives each traveler form without making appearance the source;
 * Awtsmoos.com reflects server truth through text nodes and bounded tile vessels.
 */

import { renderSharedRoadGrid } from '../world/SharedRoadAvatarRenderer.js';

export function renderJourneyState(root, state) {
	const status = root.querySelector('[data-output="status"]');
	const roadOutput = root.querySelector('[data-output="road"]');
	const gridOutput = root.querySelector('[data-output="grid"]');
	const combatOutput = root.querySelector('[data-output="combat"]');
	const controls = root.querySelector('[data-controls]');
	const attackButton = root.querySelector('[data-action="attack"]');
	status.textContent = connectionLabel(state);
	controls.hidden = !state.road;
	attackButton.disabled = !state.road || Boolean(state.road.encounter?.defeated);
	renderSharedRoadGrid(gridOutput, state);
	renderRoad(roadOutput, state);
	renderCombat(combatOutput, state);
}

function connectionLabel(state) {
	if (state.error) return state.error;
	const labels = {
		connected: 'Authenticated socket open. Attaching character…',
		connecting: 'Requesting one-use journey proof…',
		error: 'The shared world is unavailable.',
		offline: 'Offline',
		reconnecting: 'Connection dropped. Rotating reconnect proof…'
	};
	return labels[state.connection] || state.connection;
}

function renderRoad(output, state) {
	output.replaceChildren();
	if (!state.road) {
		output.textContent = 'No authoritative road snapshot received yet.';
		return;
	}
	const lamp = document.createElement('p');
	lamp.textContent = state.road.lamp?.lit
		? 'The shared lamp is burning.'
		: 'The shared lamp waits at tile 8, 4.';
	output.append(lamp);
	const list = document.createElement('ul');
	for (const player of state.road.players || []) {
		const item = document.createElement('li');
		const self = player.id === state.playerId ? ' — you' : '';
		item.textContent = `${player.glyph} ${player.displayName}${self}: `
			+ `tile ${player.x}, ${player.y}; health ${player.health}/${player.maxHealth}; `
			+ `light ${player.sharedLight}; passage shards ${player.passageShards}`;
		list.append(item);
	}
	output.append(list);
}

function renderCombat(output, state) {
	const encounter = state.road?.encounter;
	if (!encounter) {
		output.textContent = '';
		return;
	}
	output.textContent = encounter.defeated
		? 'The cooperative Veil Wisp is dispersed. Contributors received one passage shard.'
		: `Veil Wisp health: ${encounter.health}/${encounter.maxHealth}. Stand beside it and strike together.`;
}
