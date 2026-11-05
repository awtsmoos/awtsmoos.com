//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MenuWebGlPrewarmProof.mjs
 * @description Proves production warms the canonical WebGL context before Blank Meadow selection, then reaches real movement without browser failures.
 * The Awtsmoos awakens one true canvas before the traveler crosses; Awtsmoos.com measures the warmed vessel, the chosen meadow, and the clean motion as one testimony.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'https://awtsmoos.com';
const GAME_URL = `${BASE_URL}/games/mitzvahWorld/index.html`;
const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await command(`${domain}.enable`);
	await command('Network.setCacheDisabled', { cacheDisabled: true });
	await command('Network.clearBrowserCache');
	await command('Page.navigate', { url: GAME_URL });
	const menu = await waitForMenuAndPrewarm(command);
	const clickedAt = await evaluate(command, `(() => { const at = performance.now(); document.querySelector('[data-world-id="blank-meadow"]').click(); return at; })()`);
	const ready = await waitForGameplay(command);
	const before = ready.state;
	await pressKey(command, 'w', 'KeyW', 87, 1200);
	await delay(160);
	const after = await readGameplay(command);
	const displacement = Math.hypot(after.state.x - before.x, after.state.z - before.z);
	const result = {
		gameUrl: GAME_URL,
		menu,
		clickToControlMs: after.milestones.playerControllable - clickedAt,
		displacement,
		lastFrameError: after.lastFrameError,
		evidence: session.evidence
	};
	console.log(JSON.stringify(result, null, 2));
	if (!isClean(result)) process.exitCode = 1;
} finally {
	await session.close();
}

async function waitForMenuAndPrewarm(command) {
	for (let attempt = 0; attempt < 1800; attempt += 1) {
		const state = await evaluate(command, `(() => ({ now: performance.now(), button: Boolean(document.querySelector('[data-world-id="blank-meadow"]:not([disabled])')), prewarm: window.AwtsmoosMitzvahWorldWebGlPrewarm || null }))()`);
		if (state.button && state.prewarm?.status === 'ready') return state;
		await delay(5);
	}
	throw new Error('Menu/WebGL prewarm did not become ready.');
}

async function waitForGameplay(command) {
	for (let attempt = 0; attempt < 1800; attempt += 1) {
		const state = await readGameplay(command);
		if (state.runtimeFound && state.milestones.playerControllable != null) return state;
		await delay(5);
	}
	throw new Error('Blank Meadow did not become controllable.');
}

async function readGameplay(command) {
	return evaluate(command, `(() => { let runtime=null; for(const key of Object.keys(window)){ try { const value=window[key]; if(value&&typeof value==='object'&&value.state&&value.bus&&value.input){runtime=value;break;} } catch {} } const m=window.AwtsmoosMitzvahWorldStartup?.milestones||{}; return { runtimeFound:Boolean(runtime), state:runtime?.state?{x:runtime.state.x,y:runtime.state.y,z:runtime.state.z}:null, milestones:Object.fromEntries(Object.entries(m).map(([name,value])=>[name,value?.elapsedMilliseconds??null])), lastFrameError:runtime?.lastFrameError?String(runtime.lastFrameError):null }; })()`);
}

async function pressKey(command, key, code, keyCode, milliseconds) {
	await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
	await delay(milliseconds);
	await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
}

function isClean(result) {
	const evidence = result.evidence;
	return result.menu.prewarm.contextReady === true
		&& result.clickToControlMs <= 6000
		&& result.displacement > 0.01
		&& !result.lastFrameError
		&& evidence.consoleErrors.length === 0
		&& evidence.networkErrors.length === 0
		&& evidence.loadingFailures.length === 0
		&& evidence.runtimeExceptions.length === 0;
}

async function evaluate(command, expression) {
	const response = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return response.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
