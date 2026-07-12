// B"H

import { getMusagInstance } from '../../combat.js';
import { gates } from '../../../data/gates_features.js';
import { gates37 } from '../../../data/gates_37.js';

export function getShemPayload(state) {
	return {
		team: state.player.team.map(member => {
			const instance = getMusagInstance(state, member);
			return instance ? { ...instance, moves: instance.moves.map(id => state.db.moves[id]) } : null;
		}).filter(Boolean)
	};
}

export function getOtzarPayload(state) {
	return {
		team: state.player.team.map(member => getMusagInstance(state, member)),
		storage: (state.player.storage || []).map(member => getMusagInstance(state, member))
	};
}

export function getGatesPayload(state) {
	return {
		list: gates.map(gate => ({
			id: gate.id,
			name: gate.name,
			desc: gate.desc,
			isActive: Boolean(state.activeGates?.[gate.id]),
			isUnlocked: state.player.inventory.some(item => item.id === `key_${gate.id}`) || state.activeGates?.gate_55
		}))
	};
}

export function getGates37Payload(state) {
	state.player.unlockedGates37 ||= [];
	state.player.wisdomPoints ||= 0;
	return {
		points: state.player.wisdomPoints,
		gates: gates37.map(gate => ({
			...gate,
			unlocked: state.player.unlockedGates37.includes(gate.id),
			canUnlock: state.player.wisdomPoints >= gate.cost
		}))
	};
}

export function getPayloadForScreen(state, screen) {
	if (screen === 'otzar-screen') return { otzar: getOtzarPayload(state) };
	return {};
}
