// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplaySmokeProof.mjs
 * @description Proves the rebuilt Mitzvah World enters real gameplay, renders first terrain, accepts control, moves under W, and exits its CDP vessel cleanly.
 * The Awtsmoos opens the Valley, gives the traveler a road, and seals the witness when the journey is done;
 * Awtsmoos.com measures visible earth and living motion together, then closes the finite doorway beneath the same recreating sun.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9444);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:8904';
const GAME_URL = `${BASE_URL}/games/mitzvahWorld/index.html`;
const MINIMUM_DISPLACEMENT = 0.25;

const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	await command('Page.enable');
	await command('Runtime.enable');
	await command('Network.enable');
	await command('Network.setCacheDisabled', { cacheDisabled: true });
	await command('Network.clearBrowserCache');
	await command('Page.bringToFront');
	await command('Page.navigate', { url: GAME_URL });
	await waitForStudyButton(command);
	const clickedAt = await clickStudyButton(command);
	const ready = await waitForGameplay(command);
	const before = ready.state;
	await pressKey(command, 'w', 'KeyW', 87, 1200);
	await delay(180);
	const after = await readGameplay(command);
	const displacement = Math.hypot(
		after.state.x - before.x,
		after.state.z - before.z
	);
	const readyAt = Math.max(
		after.milestones.firstTerrainVisible,
		after.milestones.playerControllable
	);
	const result = {
		gameUrl: GAME_URL,
		clickedAt,
		clickToReadyMilliseconds: readyAt - clickedAt,
		milestones: after.milestones,
		before,
		after: after.state,
		displacement,
		hydrationStage: after.hydrationStage,
		lastFrameError: after.lastFrameError,
		networkErrors: session.networkErrors
	};
	console.log(JSON.stringify(result, null, 2));
	if (!(displacement > MINIMUM_DISPLACEMENT)) process.exitCode = 1;
} finally {
	await session.close();
}

/** Waits only for the real single-player launcher control to exist. */
async function waitForStudyButton(command) {
	for (let attempt = 0; attempt < 800; attempt += 1) {
		const found = await evaluate(command, `Boolean([...document.querySelectorAll('[data-world-id]')].find(button => button.textContent.trim() === 'Study this world'))`);
		if (found) return;
		await delay(10);
	}
	throw new Error('Study this world button did not become available.');
}

/** Invokes the same semantic launcher action used by the rendered control. */
async function clickStudyButton(command) {
	return evaluate(command, `(() => { const button = [...document.querySelectorAll('[data-world-id]')].find(button => button.textContent.trim() === 'Study this world'); const at = performance.now(); button.click(); return at; })()`);
}

/** Waits until rendered terrain and controllable-player milestones exist together. */
async function waitForGameplay(command) {
	for (let attempt = 0; attempt < 800; attempt += 1) {
		const state = await readGameplay(command);
		if (state.runtimeFound && state.milestones.firstTerrainVisible != null && state.milestones.playerControllable != null) return state;
		await delay(10);
	}
	throw new Error(`Gameplay readiness timed out: ${JSON.stringify(await readGameplay(command))}`);
}

/** Reads only the runtime facts required to prove first-play movement. */
async function readGameplay(command) {
	return evaluate(command, `(() => { let runtime = null; for (const key of Object.keys(window)) { try { const value = window[key]; if (value && typeof value === 'object' && value.state && value.bus && value.input) { runtime = value; break; } } catch {} } const source = window.AwtsmoosMitzvahWorldStartup?.milestones || {}; return { runtimeFound: Boolean(runtime), state: runtime?.state ? { x: runtime.state.x, y: runtime.state.y, z: runtime.state.z, facing: runtime.state.facing } : null, milestones: Object.fromEntries(Object.entries(source).map(([name, value]) => [name, value.elapsedMilliseconds])), hydrationStage: runtime?.canonicalPlayerHydrationStage || null, lastFrameError: runtime?.lastFrameError || null }; })()`);
}

/** Sends one real Chrome key hold and releases it after the measured interval. */
async function pressKey(command, key, code, keyCode, milliseconds) {
	await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
	await delay(milliseconds);
	await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
}

async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return result.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
