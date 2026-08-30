// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplaySmokeProof.mjs
 * @description Proves one exact served Mitzvah World build renders, becomes controllable, moves under real Chrome input, and emits no browser-level release errors.
 * The Awtsmoos joins visible earth, living motion, and clean testimony in one finite frame;
 * Awtsmoos.com accepts no hidden console fire behind a moving traveler, so public play and public truth carry one name.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:8910';
const GAME_URL = `${BASE_URL}/games/mitzvahWorld/index.html`;
const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	await enableProofDomains(command);
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
		clickToReadyMilliseconds: readyAt - clickedAt,
		milestones: after.milestones,
		displacement,
		lastFrameError: after.lastFrameError,
		evidence: session.evidence
	};
	console.log(JSON.stringify(result, null, 2));
	if (!releaseEvidenceIsClean(result)) process.exitCode = 1;
} finally {
	await session.close();
}

/** Enables every browser domain needed to reject hidden public-load failures. */
async function enableProofDomains(command) {
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) {
		await command(`${domain}.enable`);
	}
}

/** Waits for the real single-player launcher control. */
async function waitForStudyButton(command) {
	for (let attempt = 0; attempt < 800; attempt += 1) {
		const found = await evaluate(command, `Boolean([...document.querySelectorAll('[data-world-id]')].find(button => button.textContent.trim() === 'Study this world'))`);
		if (found) return;
		await delay(10);
	}
	throw new Error('Study this world button did not become available.');
}

/** Invokes the same semantic launcher action used by the rendered button. */
async function clickStudyButton(command) {
	return evaluate(command, `(() => { const button = [...document.querySelectorAll('[data-world-id]')].find(button => button.textContent.trim() === 'Study this world'); const at = performance.now(); button.click(); return at; })()`);
}

/** Waits for visible terrain and real control milestones together. */
async function waitForGameplay(command) {
	for (let attempt = 0; attempt < 800; attempt += 1) {
		const state = await readGameplay(command);
		if (state.runtimeFound && state.milestones.firstTerrainVisible != null && state.milestones.playerControllable != null) return state;
		await delay(10);
	}
	throw new Error(`Gameplay readiness timed out: ${JSON.stringify(await readGameplay(command))}`);
}

/** Reads only the runtime state required for release movement testimony. */
async function readGameplay(command) {
	return evaluate(command, `(() => { let runtime = null; for (const key of Object.keys(window)) { try { const value = window[key]; if (value && typeof value === 'object' && value.state && value.bus && value.input) { runtime = value; break; } } catch {} } const source = window.AwtsmoosMitzvahWorldStartup?.milestones || {}; return { runtimeFound: Boolean(runtime), state: runtime?.state ? { x: runtime.state.x, y: runtime.state.y, z: runtime.state.z, facing: runtime.state.facing } : null, milestones: Object.fromEntries(Object.entries(source).map(([name, value]) => [name, value.elapsedMilliseconds])), lastFrameError: runtime?.lastFrameError || null }; })()`);
}

/** Sends one genuine key hold through Chrome. */
async function pressKey(command, key, code, keyCode, milliseconds) {
	await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
	await delay(milliseconds);
	await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
}

/** Rejects any browser-level failure or missing movement proof. */
function releaseEvidenceIsClean(result) {
	const evidence = result.evidence;
	return result.displacement > 0.25
		&& !result.lastFrameError
		&& evidence.networkErrors.length === 0
		&& evidence.loadingFailures.length === 0
		&& evidence.runtimeExceptions.length === 0
		&& evidence.consoleErrors.length === 0;
}

async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return result.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
