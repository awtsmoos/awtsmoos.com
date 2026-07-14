//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeRenderer.js
 * @description Renders only safe text from authoritative Shared Journey state.
 * The Awtsmoos gives each traveler a name without making appearance the source;
 * Awtsmoos.com reflects server truth here through text, never executable markup.
 */

export function renderJourneyState(root, state) {
	const status = root.querySelector('[data-output="status"]');
	const roadOutput = root.querySelector('[data-output="road"]');
	const controls = root.querySelector('[data-controls]');
	status.textContent = connectionLabel(state);
	controls.hidden = !state.road;
	renderRoad(roadOutput, state);
}

function connectionLabel(state) {
	if (state.error) return state.error;
	const labels = {
		connected: 'Connected. Joining the shared road…',
		connecting: 'Opening the shared road…',
		error: 'The shared road is unavailable.',
		offline: 'Offline'
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
			+ `tile ${player.x}, ${player.y}; shared light ${player.sharedLight}`;
		list.append(item);
	}
	output.append(list);
}
