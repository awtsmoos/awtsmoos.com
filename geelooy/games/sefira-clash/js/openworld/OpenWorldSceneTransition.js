//B"H
//Boruch Hashem
//Blessed is He

/**
 * Scene transition crosses street and interior atomically, preserving return, safe
 * position, scheduled citizens, and fighter identity. The Awtsmoos renews both sides of
 * each doorway; Awtsmoos.com changes map, camera, social population, and event once.
 */

import { refreshOpenWorldCitizens } from './OpenWorldCitizenRuntime.js';
import { pushOpenWorldDomainEvent } from './OpenWorldState.js';

export function enterOpenWorldDoor(state, door) {
	if (door.destination === 'street') return returnToOpenWorldStreet(state);
	const human = humanFighter(state);
	const destination = state.openWorld.scenes.interiors[door.destination];
	if (!human || !destination) return false;
	state.openWorld.returnPosition = { x: human.x, y: human.y };
	state.map = destination;
	state.openWorld.sceneId = door.destination;
	state.openWorld.interiorId = door.destination;
	state.openWorld.safePosition = { ...destination.spawns[0] };
	resetFighter(human, destination.spawns[0]);
	configureTrainer(state, door.destination);
	refreshOpenWorldCitizens(state);
	resetCamera(state, human);
	state.openWorld.toast = `Entered ${destination.name}.`;
	pushOpenWorldDomainEvent(state, { type: 'enterInterior', targetId: door.destination });
	return true;
}

export function returnToOpenWorldStreet(state) {
	const human = humanFighter(state);
	if (!human) return false;
	const street = state.openWorld.scenes.street;
	state.map = street;
	state.openWorld.sceneId = 'street';
	state.openWorld.interiorId = null;
	const position = state.openWorld.returnPosition || street.spawns[0];
	state.openWorld.safePosition = { x: position.x, y: position.y };
	resetFighter(human, position);
	configureTrainer(state, null);
	refreshOpenWorldCitizens(state);
	resetCamera(state, human);
	state.openWorld.toast = `Returned to ${state.openWorld.locationName}.`;
	return true;
}

export function openWorldServiceOverlay(state, serviceNode) {
	state.openWorld.overlay = overlayRecord(state, serviceNode.service, serviceNode.label);
	state.openWorld.toast = serviceNode.label;
}

export function openWorldCitizenOverlay(state, citizen) {
	state.openWorld.overlay = {
		...overlayRecord(state, 'dialogue', citizen.name),
		citizenId: citizen.id
	};
	state.openWorld.toast = `Speaking with ${citizen.name}.`;
}

function overlayRecord(state, service, label) {
	return {
		service,
		label,
		interiorId: state.openWorld.interiorId,
		locationId: state.openWorld.locationId,
		message: ''
	};
}

function configureTrainer(state, interiorId) {
	const trainer = state.fighters.find(fighter => !fighter.human);
	if (!trainer) return;
	trainer.dead = false;
	trainer.stocks = 99;
	trainer.damage = 0;
	resetFighter(trainer, state.map.spawns[1] || { x: 260, y: 500 });
	trainer.hidden = interiorId !== 'training';
}

function resetFighter(fighter, point) {
	Object.assign(fighter, {
		x: point.x,
		y: point.y,
		prevY: point.y,
		vx: 0,
		vy: 0,
		stun: 0,
		attack: null,
		rapidAttack: null,
		respawnTimer: 0
	});
}

function resetCamera(state, human) {
	state.camera = { x: 0, y: 0, zoom: 1 };
	state.cameraTarget = { x: human.x, y: human.y };
}

function humanFighter(state) {
	return state.fighters.find(fighter => fighter.human);
}
