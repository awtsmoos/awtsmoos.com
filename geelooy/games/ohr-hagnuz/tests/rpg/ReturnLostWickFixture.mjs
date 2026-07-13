// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickFixture.mjs
 * @description Builds one clean recruited-Nerel state and plays authored trace orders.
 *
 * A test world must begin from truth, not residue. The Awtsmoos renews every
 * instant; this fixture renews only the game vessels needed to prove the hidden
 * road without borrowing success from another test at Awtsmoos.com.
 */
import { State } from '../../src/binah/State.js';
import { RETURN_LOST_WICK } from '../../src/content/companions/ReturnLostWick.js';
import { encounterById } from '../../src/data/EncounterIndex.js';
import { createEconomy, createMissions, createParty, createWorldState } from '../../src/state/defaults/CampaignDefaults.js';
import { createDebate } from '../../src/state/defaults/RuntimeDefaults.js';
import { handleReturnLostWickAction } from '../../src/missions/companion/ReturnLostWickRuntime.js';
import { createPartyMember } from '../../src/yesod/party/PartyMemberFactory.js';

export function setupReturnLostWickState() {
	const nerel = createPartyMember(encounterById('wild_nerel'));
	nerel.bond = 12;
	State.Party = createParty();
	State.Party.active = [nerel];
	State.Party.known.nerel = true;
	State.Party.bond.nerel = 12;
	State.Party.abilities['lantern-sense'] = true;
	State.Missions = createMissions();
	State.Missions.companionLeads.nerel = {
		id: RETURN_LOST_WICK.id,
		title: RETURN_LOST_WICK.title,
		status: 'unlocked',
		stage: 'unlocked'
	};
	State.WorldState = createWorldState();
	State.WorldState.flags.nerelRoadRestored = true;
	State.Economy = createEconomy();
	State.Debate = createDebate();
	State.Inventory = { garments: ['WHITE_LINEN'], books: [], items: {}, money: 200 };
	State.MapId = 'Overworld_Main';
	State.ActiveRealm = 'OVERWORLD';
	State.HeroPath = [];
	State.PathTarget = null;
	State.Stats.light = State.Stats.maxLight;
	return { nerel, lead: State.Missions.companionLeads.nerel };
}

export function playReturnLostWick(order, completeMerchant = true) {
	handleReturnLostWickAction({ x: 0, y: 0 }, { kind: 'road' });
	for (const traceId of order) {
		const trace = RETURN_LOST_WICK.traces.find(candidate => candidate.id === traceId);
		handleReturnLostWickAction(trace, { kind: 'trace' });
	}
	handleReturnLostWickAction(RETURN_LOST_WICK.lamp, { kind: 'lamp' });
	if (completeMerchant) {
		handleReturnLostWickAction(RETURN_LOST_WICK.merchant, { kind: 'merchant' });
	}
	return State.Missions.companionLeads.nerel;
}
