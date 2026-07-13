// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelBrowserExpressions.mjs
 * @description Drives the complete water-road through actual browser-loaded runtime modules.
 *
 * The Awtsmoos recreates test and tested world together. These expressions do not
 * paint success over the page; they walk the same mission, battle, inventory, and
 * save vessels that carry every ordinary traveler through Awtsmoos.com.
 */
const BASE = '/geelooy/games/ohr-hagnuz/src';

export const playEchoChannelExpression = `(async()=>{
	const {State}=await import('${BASE}/binah/State.js');
	const {RETURN_LOST_WICK}=await import('${BASE}/content/companions/ReturnLostWick.js');
	const {ECHO_CHANNEL}=await import('${BASE}/content/companions/EchoChannel.js');
	const wick=await import('${BASE}/missions/companion/ReturnLostWickRuntime.js');
	const channel=await import('${BASE}/missions/companion/EchoChannelRuntime.js');
	const party=await import('${BASE}/yesod/party/PartyRuntime.js');
	const rewards=await import('${BASE}/yesod/battle/BattleRewards.js');
	const {RevelationShell}=await import('${BASE}/tiferet/revelation/RevelationShell.js');
	wick.handleReturnLostWickAction({x:0,y:0},{kind:'road'});
	for(const trace of RETURN_LOST_WICK.traces)wick.handleReturnLostWickAction(trace,{kind:'object'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'object'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.merchant,{kind:'npc'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'lamp'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'lamp'});
	State.Debate.lastMove=party.partyMoves()[0];
	rewards.beginVictory('The buried pressure yields.');
	rewards.closeBattle('The echo becomes a command.',true);
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'lamp'});
	const entryMap=State.MapId;
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.thresholdGate);
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.thresholdGate);
	const depthsMap=State.MapId;
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.concealedGate);
	const blockedMap=State.MapId;
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.inscription);
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.concealedGate);
	const concealedMap=State.MapId;
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.thread);
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.concealedReturn);
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.guardian);
	State.Debate.lastMove=party.partyMoves().find(move=>move.role==='companion');
	rewards.beginVictory('The gathering current is interrupted.');
	rewards.closeBattle('The channel opens upward.',true);
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.guardian);
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.restoredLamp);
	channel.handleEchoChannelAction(ECHO_CHANNEL.points.afterword);
	RevelationShell.update();
	return {
		entryMap,depthsMap,blockedMap,concealedMap,restoredMap:State.MapId,
		flags:{...State.WorldState.flags},
		items:{...State.Inventory.items},
		garment:State.Equipment.garment,
		command:party.partyMoves().find(move=>move.role==='companion')?.name,
		renderError:globalThis.__OHR_HAGNUZ_RENDER_ERROR__||null
	};
})()`;

export const inspectEchoChannelReloadExpression = `(async()=>{
	const {State}=await import('${BASE}/binah/State.js');
	const {ECHO_CHANNEL}=await import('${BASE}/content/companions/EchoChannel.js');
	const party=await import('${BASE}/yesod/party/PartyRuntime.js');
	return {
		map:State.MapId,
		resolved:Boolean(State.WorldState.flags[ECHO_CHANNEL.flags.bossResolved]),
		mantle:Boolean(State.WorldState.flags[ECHO_CHANNEL.flags.mantleRestored]),
		afterword:Boolean(State.WorldState.flags[ECHO_CHANNEL.flags.afterwordRead]),
		garment:State.Equipment.garment,
		command:party.partyMoves().find(move=>move.role==='companion')?.name,
		renderError:globalThis.__OHR_HAGNUZ_RENDER_ERROR__||null
	};
})()`;
