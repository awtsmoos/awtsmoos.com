// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickBrowserExpressions.mjs
 * @description Defines readable in-page setup and play expressions for the real Chrome Shlichus flow.
 *
 * The Awtsmoos renews every browser realm while remaining beyond its script.
 * Awtsmoos.com keeps preparation and action in a focused vessel so verification
 * remains readable instead of hiding consequence inside compressed expressions.
 */

export const BASE = '/geelooy/games/ohr-hagnuz/src';

export const updateShellExpression = `(async()=>{
	const { RevelationShell } = await import('${BASE}/tiferet/revelation/RevelationShell.js');
	RevelationShell.update();
	return true;
})()`;

export const setupReturnLostWickExpression = `(async()=>{
	globalThis.__OHR_TEST_ERRORS__ = [];
	addEventListener('error', event => {
		globalThis.__OHR_TEST_ERRORS__.push(String(event.error?.stack || event.message));
	});
	addEventListener('unhandledrejection', event => {
		globalThis.__OHR_TEST_ERRORS__.push(String(event.reason?.stack || event.reason));
	});
	const { State } = await import('${BASE}/binah/State.js');
	const { NEREL_NITZOTZ } = await import('${BASE}/content/nitzotzos/Nerel.js');
	const defaults = await import('${BASE}/state/defaults/CampaignDefaults.js');
	const runtime = await import('${BASE}/state/defaults/RuntimeDefaults.js');
	const { createPartyMember } = await import('${BASE}/yesod/party/PartyMemberFactory.js');
	const nerel = createPartyMember(NEREL_NITZOTZ);
	State.Party = defaults.createParty();
	State.Party.active = [nerel];
	State.Party.known.nerel = true;
	State.Party.abilities['lantern-sense'] = true;
	State.Party.bond.nerel = nerel.bond;
	State.Party.leadIndex = 0;
	State.Missions = defaults.createMissions();
	State.Missions.companionLeads.nerel = {
		id: 'nerel_personal_shlichus',
		title: 'Return the Lost Wick',
		status: 'unlocked'
	};
	State.WorldState = defaults.createWorldState();
	State.Debate = runtime.createDebate();
	State.Economy = null;
	State.RuntimeFlags = {};
	State.TorahCodex = {};
	State.Skills = {};
	State.ItemInstances = null;
	State.Inventory.garments = ['WHITE_LINEN'];
	State.MapId = 'Overworld_Main';
	State.ActiveRealm = 'OVERWORLD';
	return true;
})()`;

export const playReturnLostWickExpression = `(async()=>{
	const { State } = await import('${BASE}/binah/State.js');
	const { RETURN_LOST_WICK } = await import('${BASE}/content/companions/ReturnLostWick.js');
	const wick = await import('${BASE}/missions/companion/ReturnLostWickRuntime.js');
	const shop = await import('${BASE}/yesod/economy/ShopRuntime.js');
	const policy = await import('${BASE}/yesod/economy/BentReedsTradePolicy.js');
	const { shopById } = await import('${BASE}/data/economy/ShopIndex.js');
	wick.handleReturnLostWickAction({ x: 0, y: 0 }, { kind: 'road' });
	for (const trace of RETURN_LOST_WICK.traces) {
		wick.handleReturnLostWickAction(trace, { kind: 'object' });
	}
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp, { kind: 'object' });
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.merchant, { kind: 'npc' });
	const sourceTea = shopById('merchant_exchange').items
		.find(row => row.id === 'tea');
	return {
		map: State.MapId,
		summary: wick.returnLostWickSummary(),
		flags: { ...State.WorldState.flags },
		tea: shop.shopRows().find(row => row.id === 'tea'),
		sourceTea,
		multiplier: policy.bentReedsPriceMultiplier('merchant_exchange'),
		adjusted: policy.adjustedTradeValues('merchant_exchange', sourceTea),
		bond: State.Party.bond.nerel
	};
})()`;
