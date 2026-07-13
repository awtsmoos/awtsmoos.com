// B"H
// Boruch Hashem
// Blessed is He

import { evolutions } from '../../data/evolutions.js';
import { emitBattleEvent } from './battleEvents.js';

function elevationTarget(state, member) {
	const source = state.db.musagim[member.id];
	const elevation = evolutions[member.id] || source?.evolution;
	if (!elevation || member.level < Number(elevation.level || 999)) return null;
	return elevation.target || elevation.to || null;
}

function elevateMember(state, member, targetId, sendToast) {
	const sourceId = member.id;
	member.id = targetId;
	sendToast(`Elevated into ${state.db.musagim[targetId]?.name || targetId}!`, 'success');
	emitBattleEvent(state, {
		type: 'elevate_musag',
		targetId: sourceId,
		fromId: sourceId,
		toId: targetId,
		quantity: 1
	}, sendToast);
}

function levelMember(state, member, sendUIUpdate, sendToast) {
	member.level += 1;
	member.xp = 0;
	sendToast(`${state.db.musagim[member.id]?.name || member.id} Leveled Up!`, 'success');
	sendUIUpdate({ fx: { type: 'levelup' } });
	emitBattleEvent(state, {
		type: 'train_level',
		targetId: 'party_musag',
		quantity: member.level
	}, sendToast);
	const targetId = elevationTarget(state, member);
	if (targetId) elevateMember(state, member, targetId, sendToast);
}

/** Shares experience across the party and performs eligible elevations once. */
export function grantBattleExperience(state, amount, sendUIUpdate, sendToast) {
	for (const member of state.player.team) {
		member.xp = (member.xp || 0) + amount;
		if (member.xp >= member.level * 100) {
			levelMember(state, member, sendUIUpdate, sendToast);
		}
	}
}
