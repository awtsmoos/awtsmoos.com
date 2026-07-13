// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoBeneathBentReedsBrowserExpressions.mjs
 * @description Defines browser-side setup, play, and reload inspections for the echo chapter.
 *
 * The Awtsmoos renews state and witness together; these expressions enter the
 * actual modules instead of painting a false result over the browser vessel of
 * Awtsmoos.com.
 */
const BASE = '/geelooy/games/ohr-hagnuz/src';

export const updateShellExpression = `(async()=>{
	const {RevelationShell}=await import('${BASE}/tiferet/revelation/RevelationShell.js');
	RevelationShell.update();
	return true;
})()`;

export const setupEchoExpression = `(async()=>{
	globalThis.__OHR_TEST_ERRORS__=[];
	addEventListener('error',event=>globalThis.__OHR_TEST_ERRORS__.push(String(event.error?.stack||event.message)));
	addEventListener('unhandledrejection',event=>globalThis.__OHR_TEST_ERRORS__.push(String(event.reason?.stack||event.reason)));
	const {State}=await import('${BASE}/binah/State.js');
	const {NEREL_NITZOTZ}=await import('${BASE}/content/nitzotzos/Nerel.js');
	const defaults=await import('${BASE}/state/defaults/CampaignDefaults.js');
	const runtime=await import('${BASE}/state/defaults/RuntimeDefaults.js');
	const {createPartyMember}=await import('${BASE}/yesod/party/PartyMemberFactory.js');
	const nerel=createPartyMember(NEREL_NITZOTZ);
	State.Party=defaults.createParty();
	State.Party.active=[nerel];
	State.Party.known.nerel=true;
	State.Party.abilities['lantern-sense']=true;
	State.Party.bond.nerel=nerel.bond;
	State.Party.leadIndex=0;
	State.Missions=defaults.createMissions();
	State.Missions.companionLeads.nerel={id:'nerel_personal_shlichus',title:'Return the Lost Wick',status:'unlocked'};
	State.WorldState=defaults.createWorldState();
	State.Debate=runtime.createDebate();
	State.Economy=null;
	State.MapId='Overworld_Main';
	State.ActiveRealm='OVERWORLD';
	return true;
})()`;

export const playEchoExpression = `(async()=>{
	const {State}=await import('${BASE}/binah/State.js');
	const {RETURN_LOST_WICK}=await import('${BASE}/content/companions/ReturnLostWick.js');
	const wick=await import('${BASE}/missions/companion/ReturnLostWickRuntime.js');
	const party=await import('${BASE}/yesod/party/PartyRuntime.js');
	const rewards=await import('${BASE}/yesod/battle/BattleRewards.js');
	wick.handleReturnLostWickAction({x:0,y:0},{kind:'road'});
	for(const trace of RETURN_LOST_WICK.traces)wick.handleReturnLostWickAction(trace,{kind:'object'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'object'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.merchant,{kind:'npc'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'lamp'});
	const discovered=Boolean(State.WorldState.flags.bentReedsEchoDiscovered);
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'lamp'});
	const battle={realm:State.ActiveRealm,marker:State.Debate.enemy?.echoBeneathBentReeds,log:[...State.Debate.log]};
	State.Debate.lastMove=party.partyMoves()[0];
	rewards.beginVictory('The buried pressure yields.');
	const companion=party.partyMoves().find(move=>move.role==='companion');
	return {
		discovered,
		battle,
		summary:wick.returnLostWickSummary(),
		flags:{...State.WorldState.flags},
		ability:Boolean(State.Party.abilities['nerel-echo-command']),
		command:companion?.name,
		bond:State.Party.bond.nerel,
		performance:globalThis.__OHR_HAGNUZ_PERFORMANCE__
	};
})()`;

export const reloadEchoExpression = `(async()=>{
	const {State}=await import('${BASE}/binah/State.js');
	const wick=await import('${BASE}/missions/companion/ReturnLostWickRuntime.js');
	const party=await import('${BASE}/yesod/party/PartyRuntime.js');
	return {
		summary:wick.returnLostWickSummary(),
		resolved:Boolean(State.WorldState.flags.bentReedsEchoResolved),
		ability:Boolean(State.Party.abilities['nerel-echo-command']),
		command:party.partyMoves().find(move=>move.role==='companion')?.name,
		renderError:globalThis.__OHR_HAGNUZ_RENDER_ERROR__||null,
		performance:globalThis.__OHR_HAGNUZ_PERFORMANCE__
	};
})()`;
