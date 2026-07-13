//B"H
//Boruch Hashem
//Blessed is He

/**
 * One lobby card reveals one player's covenant of choice in Awtsmoos.com.
 * The Awtsmoos renews seat, device, character, team, and readiness together
 * so every visible control corresponds to an actual runtime field.
 */
import { CHARACTERS, characterById } from '../data/characters.js';
import { lobbyField, lobbyKindOptions, lobbySelect, lobbyTeamOptions } from './lobbyFieldView.js';

/** Builds the declarative view for one local player slot. */
export function lobbySlotView(slot, devices, handlers) {
	const character = characterById(slot.characterId);
	return {
		tag: 'article',
		attrs: {
			class: `lobbySlot lobbySlot-${slot.kind}`,
			style: `--player-color: ${slot.color}`
		},
		children: [
			header(slot),
			lobbyField('Seat', kindSelect(slot, handlers)),
			...humanFields(slot, devices, handlers),
			...activeFields(slot, handlers),
			identity(character),
			readyButton(slot, handlers)
		]
	};
}

function header(slot) {
	const connection = slot.kind === 'human' && !slot.connected ? 'Disconnected' : slot.kind;
	return {
		tag: 'header',
		attrs: { class: 'lobbySlotHeader' },
		children: [
			{ tag: 'strong', children: [`P${slot.index + 1}`] },
			{ tag: 'span', children: [connection] }
		]
	};
}

function humanFields(slot, devices, handlers) {
	if (slot.kind !== 'human') {
		return [];
	}
	const available = devices.filter(device => !device.owner || device.owner === slot.id);
	const select = lobbySelect(slot.deviceId, available, handlers.onDevice, 'id', 'label');
	return [lobbyField('Device', select)];
}

function activeFields(slot, handlers) {
	if (slot.kind === 'closed') {
		return [];
	}
	const fighter = lobbySelect(slot.characterId, CHARACTERS, handlers.onCharacter, 'id', 'name');
	const team = lobbySelect(String(slot.team), lobbyTeamOptions(), handlers.onTeam, 'id', 'label');
	return [lobbyField('Fighter', fighter), lobbyField('Team', team)];
}

function identity(character) {
	return {
		tag: 'div',
		attrs: { class: 'lobbyIdentity' },
		children: [
			{ tag: 'b', children: [character.sefira] },
			{ tag: 'span', children: [character.role] },
			{ tag: 'small', children: [`${character.weaponId} · ${character.ability}`] }
		]
	};
}

function readyButton(slot, handlers) {
	if (slot.kind !== 'human') {
		return {
			tag: 'p',
			attrs: { class: 'lobbyReadyLabel' },
			children: [slot.kind === 'cpu' ? 'CPU Ready' : 'Seat Closed']
		};
	}
	return {
		tag: 'button',
		attrs: {
			class: slot.ready ? 'primaryMenuButton' : 'backMenuButton',
			type: 'button',
			disabled: !slot.connected
		},
		on: { click: handlers.onReady },
		children: [slot.ready ? 'Ready' : 'Press Ready']
	};
}

function kindSelect(slot, handlers) {
	return lobbySelect(slot.kind, lobbyKindOptions(), handlers.onKind, 'id', 'label');
}
