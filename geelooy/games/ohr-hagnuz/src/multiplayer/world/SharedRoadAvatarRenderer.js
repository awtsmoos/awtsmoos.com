//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadAvatarRenderer.js
 * @description Places lamp, Veil Wisp, and safe remote traveler glyphs on the grid.
 * The Awtsmoos renews every visible form without possessing form; Awtsmoos.com
 * renders only server projections through text nodes and measured coordinates.
 */

import {
	createSharedRoadGrid,
	sharedRoadCell
} from './SharedRoadGrid.js';

export function renderSharedRoadGrid(container, state) {
	container.replaceChildren();
	if (!state.road) {
		container.textContent = 'Awaiting an authoritative road snapshot.';
		return;
	}
	const grid = createSharedRoadGrid(container.ownerDocument);
	container.append(grid);
	renderEntity(grid, state.road.lamp, {
		className: state.road.lamp?.lit ? 'road-lamp road-lamp--lit' : 'road-lamp',
		label: state.road.lamp?.lit ? 'Shared lamp burning' : 'Shared lamp waiting',
		text: state.road.lamp?.lit ? '🔥' : '🕯️'
	});
	renderEntity(grid, state.road.encounter, {
		className: state.road.encounter?.defeated ? 'veil-wisp veil-wisp--defeated' : 'veil-wisp',
		label: encounterLabel(state.road.encounter),
		text: state.road.encounter?.defeated ? '✦' : '◉'
	});
	for (const player of state.road.players || []) {
		renderPlayer(grid, player, player.id === state.playerId);
	}
}

function renderPlayer(grid, player, isSelf) {
	const entity = renderEntity(grid, player, {
		className: isSelf ? 'road-traveler road-traveler--self' : 'road-traveler',
		label: `${player.displayName}, health ${player.health} of ${player.maxHealth}`,
		text: player.glyph
	});
	if (!entity) return;
	const name = grid.ownerDocument.createElement('small');
	name.textContent = isSelf ? `${player.displayName} · you` : player.displayName;
	entity.append(name);
}

function renderEntity(grid, position, options) {
	if (!position) return null;
	const cell = sharedRoadCell(grid, position.x, position.y);
	if (!cell) return null;
	const entity = grid.ownerDocument.createElement('span');
	entity.className = options.className;
	entity.setAttribute('role', 'img');
	entity.setAttribute('aria-label', options.label);
	const glyph = grid.ownerDocument.createElement('b');
	glyph.textContent = options.text;
	entity.append(glyph);
	cell.append(entity);
	return entity;
}

function encounterLabel(encounter) {
	if (!encounter) return 'No encounter';
	return encounter.defeated
		? 'Veil Wisp dispersed'
		: `Veil Wisp, health ${encounter.health} of ${encounter.maxHealth}`;
}
