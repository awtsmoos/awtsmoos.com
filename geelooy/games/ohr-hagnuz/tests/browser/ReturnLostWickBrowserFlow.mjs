// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickBrowserFlow.mjs
 * @description Plays Nerel's Shlichus in real Chrome and proves visible persistent consequence.
 *
 * The Awtsmoos recreates browser, player, and witnessed road every instant. This
 * flow refuses invisible success: map, chosen approach, journal, price, save,
 * and narrow-screen vessel must reveal one truthful deed at Awtsmoos.com.
 */
import assert from 'node:assert/strict';

const BASE = '/geelooy/games/ohr-hagnuz/src';
const updateShell = `(async()=>{const {RevelationShell}=await import('${BASE}/tiferet/revelation/RevelationShell.js');RevelationShell.update();return true;})()`;

const setupExpression = `(async()=>{
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

const playExpression = `(async()=>{
	const {State}=await import('${BASE}/binah/State.js');
	const {RETURN_LOST_WICK}=await import('${BASE}/content/companions/ReturnLostWick.js');
	const wick=await import('${BASE}/missions/companion/ReturnLostWickRuntime.js');
	const shop=await import('${BASE}/yesod/economy/ShopRuntime.js');
	const policy=await import('${BASE}/yesod/economy/BentReedsTradePolicy.js');
	const {shopById}=await import('${BASE}/data/economy/ShopIndex.js');
	wick.handleReturnLostWickAction({x:0,y:0},{kind:'road'});
	for(const trace of RETURN_LOST_WICK.traces)wick.handleReturnLostWickAction(trace,{kind:'object'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.lamp,{kind:'object'});
	wick.handleReturnLostWickAction(RETURN_LOST_WICK.merchant,{kind:'npc'});
	const sourceTea=shopById('merchant_exchange').items.find(row=>row.id==='tea');
	return {
		map:State.MapId,
		summary:wick.returnLostWickSummary(),
		flags:{...State.WorldState.flags},
		tea:shop.shopRows().find(row=>row.id==='tea'),
		sourceTea,
		multiplier:policy.bentReedsPriceMultiplier('merchant_exchange'),
		adjusted:policy.adjustedTradeValues('merchant_exchange',sourceTea),
		bond:State.Party.bond.nerel
	};
})()`;

const openJournal = client => client.evaluate(`(async()=>{
	document.querySelector('[data-revelation-panel="journal"]')?.click();
	const {MobileControls}=await import('${BASE}/tiferet/ui/MobileControls.js');
	MobileControls.update();
	return true;
})()`);

export const runReturnLostWickBrowserFlow = async (client, screenshotPath) => {
	await client.evaluate(setupExpression);
	await client.evaluate(updateShell);
	await client.waitFor(`globalThis.__OHR_HAGNUZ_REVELATION__?.questTitle==='Return the Lost Wick'`, 5000);
	await client.screenshot(screenshotPath('browser-desktop-wick-unlocked.png'));
	const played = await client.evaluate(playExpression);
	assert.equal(played.map, 'Bent_Reeds_LampHouse');
	assert.equal(played.summary.status, 'completed');
	assert.equal(played.flags.bentReedsTradeRouteRestored, true);
	assert.equal(played.flags.bentReedsVeilWeakened, true);
	assert.equal(played.multiplier, played.summary.consequences.tradeMultiplier);
	assert.equal(played.adjusted.buy, Math.round(played.sourceTea.buy * played.multiplier));
	assert.equal(played.tea.buy, played.adjusted.buy);
	await client.evaluate(updateShell);
	await openJournal(client);
	await client.waitFor(`document.body.innerText.includes('Return the Lost Wick')&&document.body.innerText.includes('completed')`, 5000);
	await client.screenshot(screenshotPath('browser-desktop-wick-complete.png'));
	const saved = await client.evaluate(`(()=>{const result=OhrHaGnuzSave.saveGame(localStorage);return {ok:result.ok,schema:result.envelope.schemaVersion};})()`);
	assert.deepEqual(saved, { ok: true, schema: 3 });
	await client.send('Page.reload', { ignoreCache: true });
	await client.waitFor(`document.readyState==='complete'&&Boolean(document.querySelector('#revelation-shell'))`, 12000);
	const returned = await client.evaluate(`(async()=>{const {State}=await import('${BASE}/binah/State.js');const {returnLostWickSummary}=await import('${BASE}/missions/companion/ReturnLostWickRuntime.js');return {summary:returnLostWickSummary(),flags:{...State.WorldState.flags}};})()`);
	assert.equal(returned.summary.status, 'completed');
	assert.equal(returned.flags.bentReedsLampRestored, true);
	await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
	await openJournal(client);
	await client.waitFor(`matchMedia('(max-width:760px)').matches&&document.body.innerText.includes('Return the Lost Wick')`, 5000);
	const mobile = await client.evaluate(`({mobile:matchMedia('(max-width:760px)').matches,journal:document.body.innerText.includes('Road revealed and restored')})`);
	assert.deepEqual(mobile, { mobile: true, journal: true });
	await client.screenshot(screenshotPath('browser-mobile-wick-journal.png'));
	return { played, saved, returned, mobile };
};
