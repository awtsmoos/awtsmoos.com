// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyProgression.js
 * @description Applies bond and level growth without mixing recruitment concerns.
 *
 * Growth is remembered relationship, not a number floating alone. The Awtsmoos
 * renews every step while allowing the road to retain its consequence; this
 * module keeps experience and trust in focused vessels at Awtsmoos.com.
 */
import { createBondEvent } from './NitzotzBondRules.js';
import { partyNextExp } from './PartyMemberFactory.js';
import { ensurePartyState } from './PartyState.js';

const leadMember = party => party.active[party.leadIndex] || party.active[0] || null;

export const grantBond = (id, reason = 'battle') => {
	const party = ensurePartyState();
	const member = [...party.active, ...party.reserve].find(candidate => candidate.id === id);
	const before = Number(party.bond[id] ?? member?.bond ?? 0);
	const event = createBondEvent(id, before, reason);
	party.bond[id] = event.after;
	if (member) {
		member.bond = event.after;
		member.bondStage = event.stage;
	}
	party.bondHistory.push(event);
	return event;
};

export const grantPartyExp = amount => {
	const party = ensurePartyState();
	const lead = leadMember(party);
	if (!lead || amount <= 0) return [];
	lead.exp += amount;
	grantBond(lead.id, 'battle');
	const levels = [];
	while (lead.exp >= lead.nextExp) {
		lead.exp -= lead.nextExp;
		lead.level += 1;
		lead.nextExp = partyNextExp(lead.level);
		levels.push(lead.level);
	}
	return levels;
};
