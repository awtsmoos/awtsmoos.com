// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyState.js
 * @description Normalizes the durable companion vessel without replacing healthy members.
 *
 * A bond should not lose its living identity whenever another system asks to
 * see it. The Awtsmoos renews every being without confusing renewal with
 * erasure; this state vessel preserves stable companions beneath Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { normalizePartyMember } from './PartyMemberFactory.js';

const defaults = () => ({
	starterId: null,
	active: [],
	reserve: [],
	known: {},
	leadIndex: 0,
	maximumActive: 3,
	bond: {},
	evolutions: {},
	abilities: {},
	bondHistory: []
});

const isNormalized = member => Boolean(
	member
	&& Array.isArray(member.moves)
	&& typeof member.bondStage === 'string'
	&& Object.hasOwn(member, 'preferredCare')
);

const normalizeList = list => (list || []).map(member => (
	isNormalized(member) ? member : normalizePartyMember(member)
));

export const ensurePartyState = () => {
	State.Party = { ...defaults(), ...(State.Party || {}) };
	State.Party.active = normalizeList(State.Party.active);
	State.Party.reserve = normalizeList(State.Party.reserve);
	State.Party.known ||= {};
	State.Party.bond ||= {};
	State.Party.abilities ||= {};
	State.Party.bondHistory ||= [];
	return State.Party;
};
