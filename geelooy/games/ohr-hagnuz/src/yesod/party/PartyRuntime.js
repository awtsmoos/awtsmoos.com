/**
 * B"H
 * @module PartyRuntime
 * @description Starter choice, active party, reserve, levels, bonds, and lead selection.
 */
import { State } from '../../binah/State.js';
import { starterById } from '../../content/prologue/StarterMusagim.js';
import { createPartyMember, partyNextExp } from './PartyMemberFactory.js';

export const ensurePartyState = () => {
	State.Party ||= {
		starterId: null, active: [], reserve: [], known: {}, leadIndex: 0,
		maximumActive: 3, bond: {}, evolutions: {}
	};
	State.Party.active ||= [];
	State.Party.reserve ||= [];
	State.Party.known ||= {};
	return State.Party;
};

export const chooseStarter = id => {
	const party = ensurePartyState();
	if (party.starterId) return { ok: false, reason: 'starter-already-chosen' };
	const source = starterById(id);
	if (!source) return { ok: false, reason: 'unknown-starter' };
	const member = createPartyMember(source);
	party.starterId = id;
	party.active.push(member);
	party.known[id] = true;
	party.bond[id] = 1;
	State.say(`${member.name} joined you. Four direct moves are now ready.`, 520);
	return { ok: true, member };
};

export const leadMusag = () => {
	const party = ensurePartyState();
	return party.active[party.leadIndex] || party.active[0] || null;
};

export const setLeadMusag = index => {
	const party = ensurePartyState();
	const member = party.active[index];
	if (!member) return { ok: false, reason: 'invalid-party-index' };
	party.leadIndex = index;
	State.say(`${member.name} is now leading. Its four moves will open the next battle.`, 360);
	return { ok: true, member };
};

export const partyMoves = () => {
	const lead = leadMusag();
	if (!lead?.moves?.length) return [];
	const bonus = Math.floor((lead.level - 1) * 1.5);
	return lead.moves.slice(0, 4).map(move => ({ ...move, power: (move.power || 0) + bonus }));
};

export const addMusagFromEncounter = encounter => {
	const party = ensurePartyState();
	const id = encounter?.speciesId || encounter?.id;
	if (!id || party.known[id]) return { ok: false, reason: 'already-known' };
	const member = createPartyMember({ ...encounter, id });
	party.known[id] = true;
	party.bond[id] = 0;
	const destination = party.active.length < party.maximumActive ? party.active : party.reserve;
	destination.push(member);
	return { ok: true, member, destination: destination === party.active ? 'active' : 'reserve' };
};

export const grantPartyExp = amount => {
	const lead = leadMusag();
	if (!lead || amount <= 0) return [];
	lead.exp += amount;
	lead.bond += 1;
	const levels = [];
	while (lead.exp >= lead.nextExp) {
		lead.exp -= lead.nextExp;
		lead.level += 1;
		lead.nextExp = partyNextExp(lead.level);
		levels.push(lead.level);
	}
	return levels;
};

export const partyRows = () => ensurePartyState().active.map((member, index) => [
	`${index === State.Party.leadIndex ? '★ ' : ''}${member.name}`,
	`Lv ${member.level} • ${member.element} • bond ${member.bond}`
]);
