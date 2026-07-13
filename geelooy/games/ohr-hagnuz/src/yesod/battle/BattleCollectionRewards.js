// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleCollectionRewards.js
 * @description Resolves voluntary joining and records the changed companion road.
 *
 * A defeated body is not a possessed soul. The Awtsmoos creates creature,
 * freedom, and answer beyond the player's claim; this vessel records only the
 * bond that was willingly revealed through witnessed deeds at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { addMusagFromEncounter } from '../party/PartyRuntime.js';
import { evaluateBattleTrust } from './BattleTrust.js';

const recordConsequence = defeated => {
	const id = defeated.speciesId || defeated.id;
	State.Missions.flags ||= {};
	State.Missions.history ||= [];
	State.Missions.companionLeads ||= {};
	State.WorldState.flags ||= {};
	State.Missions.flags[`${id}Rescued`] = true;
	State.WorldState.flags[`${id}RoadRestored`] = true;
	State.Missions.companionLeads[id] = {
		id: `${id}_personal_shlichus`,
		category: 'Companion Shlichus',
		title: defeated.personalShlichus || `${defeated.name}'s Road`,
		objective: defeated.personalShlichus || 'Follow the companion road that opened.',
		region: defeated.region || State.MapId,
		entrustedBy: defeated.name,
		status: 'unlocked',
		linkedSystems: ['Nitzotz Bond', 'Hidden Road', 'World State']
	};
	State.Missions.history.unshift({
		type: 'CREATURE_BOND',
		target: id,
		at: Date.now(),
		consequence: defeated.personalShlichus || 'A companion road opened.'
	});
};

export const grantCollectionReward = (defeated, message) => {
	if (!defeated.speciesId) return message;
	if (!defeated.trustProfile) {
		const collected = addMusagFromEncounter(defeated);
		return collected.ok
			? `${message} ${collected.member.name} joined the ${collected.destination} party.`
			: message;
	}
	const trust = evaluateBattleTrust();
	if (!trust.eligible) {
		return `${message} ${defeated.name} remains free. ${trust.explanation}`;
	}
	const collected = addMusagFromEncounter(defeated, { trustEligible: true });
	if (!collected.ok) return `${message} ${defeated.name}: ${collected.reason}.`;
	recordConsequence(defeated);
	return `${message} ${collected.member.name} chose the ${collected.destination} party. ${trust.explanation}`;
};
