// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NitzotzBrowserFlow.mjs
 * @description Plays the complete Nerel battle through the public browser engine.
 *
 * A background tab may sleep, but the game law remains awake. The Awtsmoos
 * renews every turn whether a window is foreground or concealed; this flow
 * advances the same public heartbeat and proves its consequences at Awtsmoos.com.
 */
import assert from 'node:assert/strict';

const BASE = '/geelooy/games/ohr-hagnuz/src';
const stateExpression = fields => `(async()=>{const {State}=await import('${BASE}/binah/State.js');return (${fields});})()`;
const moveExpression = index => `(async()=>{const {useMove}=await import('${BASE}/yesod/OhrDebate.js');return useMove(${index});})()`;
const tickExpression = `(async()=>{const {debateTick}=await import('${BASE}/yesod/OhrDebate.js');return debateTick({});})()`;

const phaseSnapshot = client => client.evaluate(stateExpression(`({
	realm:State.ActiveRealm,
	phase:State.Debate.phase,
	turn:State.Debate.turn,
	enemyLight:State.Debate.enemyLight
})`));

const advanceToChoice = async (client, minimumTurn = 0) => {
	for (let pulse = 0; pulse < 240; pulse += 1) {
		const state = await phaseSnapshot(client);
		if (state.realm !== 'DEBATE') return state;
		if (state.phase === 'choice' && state.turn >= minimumTurn) return state;
		await client.evaluate(tickExpression);
	}
	throw new Error(`Battle did not reach choice after turn ${minimumTurn}.`);
};

const advanceToOverworld = async client => {
	for (let pulse = 0; pulse < 240; pulse += 1) {
		const state = await phaseSnapshot(client);
		if (state.realm !== 'DEBATE') return state;
		await client.evaluate(tickExpression);
	}
	throw new Error('Battle did not close after rewards.');
};

const setupExpression = `(async()=>{
	globalThis.__OHR_TEST_ERRORS__=[];
	addEventListener('error',event=>globalThis.__OHR_TEST_ERRORS__.push(String(event.error?.stack||event.message)));
	addEventListener('unhandledrejection',event=>globalThis.__OHR_TEST_ERRORS__.push(String(event.reason?.stack||event.reason)));
	const {State}=await import('${BASE}/binah/State.js');
	const {encounterById}=await import('${BASE}/data/EncounterIndex.js');
	const {startDebate}=await import('${BASE}/yesod/OhrDebate.js');
	const defaults=await import('${BASE}/state/defaults/CampaignDefaults.js');
	const runtime=await import('${BASE}/state/defaults/RuntimeDefaults.js');
	State.Party=defaults.createParty();
	State.Missions=defaults.createMissions();
	State.WorldState=defaults.createWorldState();
	State.Debate=runtime.createDebate();
	State.ActiveRealm='OVERWORLD';
	State.Stats.light=State.Stats.maxLight;
	startDebate(encounterById('wild_nerel'));
	return true;
})()`;

const playAttackTurn = async client => {
	const state = await phaseSnapshot(client);
	if (state.realm !== 'DEBATE' || state.enemyLight <= 0) return false;
	assert.equal(await client.evaluate(moveExpression(0)), true);
	await advanceToChoice(client, state.turn + 1);
	return true;
};

export const runBattleFlow = async (client, screenshotPath) => {
	await client.evaluate(setupExpression);
	await advanceToChoice(client);
	const opening = await client.evaluate(stateExpression(`({
		intent:State.Debate.intent,
		moves:State.Debate.moves.map(move=>({role:move.role,path:move.path})),
		enemyLight:State.Debate.enemyLight
	})`));
	assert.equal(opening.intent.name, 'Reedlight Feint');
	assert.deepEqual(opening.moves.map(move => move.role), ['attack', 'study', 'guard', 'companion']);
	assert.ok(opening.moves.every(move => typeof move.path === 'string'));
	await client.screenshot(screenshotPath('browser-desktop-battle.png'));

	assert.equal(await client.evaluate(moveExpression(1)), true);
	await advanceToChoice(client, 1);
	const studied = await client.evaluate(stateExpression(`({intent:State.Debate.intent,trust:State.Debate.trust.evidence})`));
	assert.equal(studied.trust.studied, true);
	assert.equal(studied.intent.name, 'Reedflare Rush');
	assert.equal(await client.evaluate(moveExpression(2)), true);
	await advanceToChoice(client, 2);
	assert.equal(await client.evaluate(stateExpression(`State.Debate.trust.evidence.guardedCharge`)), true);

	for (let attempt = 0; attempt < 8; attempt += 1) {
		if (!await playAttackTurn(client)) break;
	}
	await advanceToOverworld(client);
	await client.evaluate(`(async()=>{const {RevelationShell}=await import('${BASE}/tiferet/revelation/RevelationShell.js');RevelationShell.update();return true;})()`);
	const recruited = await client.evaluate(stateExpression(`({
		member:State.Party.active[0],
		ability:State.Party.abilities['lantern-sense'],
		mission:State.Missions.companionLeads.nerel,
		world:State.WorldState.flags.nerelRoadRestored
	})`));
	assert.equal(recruited.member.name, 'Nerel');
	assert.equal(recruited.ability, true);
	assert.equal(recruited.mission.status, 'unlocked');
	assert.equal(recruited.world, true);
	await client.evaluate(`(async()=>{document.querySelector('[data-revelation-panel="party"]')?.click();const {MobileControls}=await import('${BASE}/tiferet/ui/MobileControls.js');MobileControls.update();return true;})()`);
	await client.waitFor(`document.body.innerText.includes('Nitzotz Bonds')&&document.body.innerText.includes('Lantern Sense')`, 5000);
	await client.screenshot(screenshotPath('browser-desktop-party.png'));
	return { opening, recruited };
};
