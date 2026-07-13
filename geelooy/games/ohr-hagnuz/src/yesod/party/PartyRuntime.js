// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyRuntime.js
 * @description Coordinates starter choice, leadership, recruitment, growth, and authored commands.
 *
 * Companions are not numbers gathered into a sack. The Awtsmoos renews every
 * traveler and every willing bond; this conductor keeps joining, leading, and
 * remembered road gifts clear while smaller vessels serve Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_BENEATH_BENT_REEDS } from '../../content/companions/EchoBeneathBentReeds.js';
import { starterById } from '../../content/prologue/StarterMusagim.js';
import { createPartyMember } from './PartyMemberFactory.js';
import { grantBond, grantPartyExp } from './PartyProgression.js';
import { ensurePartyState } from './PartyState.js';
import { resolveNerelEchoCommand } from './NerelEchoCommand.js';

export { ensurePartyState, grantBond, grantPartyExp };

export const chooseStarter = id => {
	const party = ensurePartyState();
	if (party.starterId) return { ok: false, reason: 'starter-already-chosen' };
	const source = starterById(id);
	if (!source) return { ok: false, reason: 'unknown-starter' };
	const member = createPartyMember(source);
	party.starterId = id;
	party.active.push(member);
	party.known[id] = true;
	const bond = grantBond(id, 'recruited');
	State.say(`${member.name} joined you. Four direct moves are ready.`, 520);
	return { ok: true, member, bond };
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
	State.say(`${member.name} is now leading. Its four moves open the next battle.`, 360);
	return { ok: true, member };
};

function echoContext(party, lead) {
	return {
		leadId: lead?.id,
		unlocked: Boolean(party.abilities[ECHO_BENEATH_BENT_REEDS.abilityId]),
		approachId: State.WorldState?.flags?.bentReedsRestorationApproach
	};
}

export const partyMoves = () => {
	const party = ensurePartyState();
	const lead = leadMusag();
	if (!lead?.moves?.length) return [];
	const bonus = Math.floor((lead.level - 1) * 1.5);
	const context = echoContext(party, lead);
	return lead.moves.slice(0, 4).map(move => {
		const revealed = resolveNerelEchoCommand(move, context);
		return { ...revealed, power: (revealed.power || 0) + bonus };
	});
};

export const addMusagFromEncounter = (encounter, options = {}) => {
	const party = ensurePartyState();
	const id = encounter?.speciesId || encounter?.id;
	if (!id || party.known[id]) return { ok: false, reason: 'already-known' };
	if (encounter.trustProfile && !options.trustEligible) {
		return { ok: false, reason: 'trust-required' };
	}
	const member = createPartyMember({ ...encounter, id });
	const destination = party.active.length < party.maximumActive ? party.active : party.reserve;
	party.known[id] = true;
	destination.push(member);
	const bond = grantBond(id, 'recruited');
	if (member.explorationAbility?.id) party.abilities[member.explorationAbility.id] = true;
	return {
		ok: true,
		member,
		bond,
		destination: destination === party.active ? 'active' : 'reserve'
	};
};

export const partyAbilityUnlocked = id => Boolean(ensurePartyState().abilities[id]);

export const partyRows = () => ensurePartyState().active.map((member, index) => [
	`${index === State.Party.leadIndex ? '★ ' : ''}${member.name}`,
	`Lv ${member.level} • ${member.element} • ${member.bondStage} ${member.bond}`
]);
