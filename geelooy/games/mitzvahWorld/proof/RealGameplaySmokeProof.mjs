//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RealGameplaySmokeProof.mjs
 * @description Proves Blank Meadow renders, becomes controllable, moves under real Chrome input, and emits no release errors.
 * The Awtsmoos lets Awtsmoos.com distinguish browser-cleanup testimony from game testimony: a brand-new proof profile already
 * begins empty, so Chrome refusing a redundant cache-clear command may never conceal whether the actual meadow lives or fails.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:8910';
const GAME_URL = `${BASE_URL}/games/mitzvahWorld/index.html`;
const WORLD_ID = 'blank-meadow';
const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	await enableProofDomains(command);
	await command('Network.setCacheDisabled', { cacheDisabled: true });
	await clearBrowserCacheBestEffort(command);
	await command('Page.bringToFront');
	await command('Page.navigate', { url: GAME_URL });
	await waitForWorldButton(command);
	const clickedAt = await clickWorldButton(command);
	const ready = await waitForGameplay(command);
	const before = ready.state;
	await pressKey(command, 'w', 'KeyW', 87, 1200);
	await delay(180);
	const after = await readGameplay(command);
	const displacement = Math.hypot(after.state.x - before.x, after.state.z - before.z);
	const readyAt = Math.max(after.milestones.firstTerrainVisible, after.milestones.playerControllable);
	const result = {
		gameUrl: GAME_URL,
		worldId: WORLD_ID,
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
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await command(`${domain}.enable`);
}

/** Treats redundant cache cleanup as browser housekeeping, while cache disabling itself remains mandatory. */
async function clearBrowserCacheBestEffort(command) {
	try {
		await command('Network.clearBrowserCache');
	} catch (error) {
		if (!String(error?.message || error).includes('CDP_TIMEOUT:Network.clearBrowserCache')) throw error;
	}
}

/** Waits for the stable reliability-world launcher control rather than transient UI copy. */
async function waitForWorldButton(command) {
	for (let attempt = 0; attempt < 1200; attempt += 1) {
		const found = await evaluate(command, `Boolean(document.querySelector('[data-world-id="${WORLD_ID}"]:not([disabled])'))`);
		if (found) return;
		await delay(10);
	}
	throw new Error(`${WORLD_ID} launcher did not become available.`);
}

/** Invokes the exact launcher control identified by the canonical world id. */
async function clickWorldButton(command) {
	return evaluate(command, `(() => { const button = document.querySelector('[data-world-id="${WORLD_ID}"]'); const at = performance.now(); button.click(); return at; })()`);
}

/** Waits for visible terrain and real control milestones together. */
async function waitForGameplay(command) {
	for (let attempt = 0; attempt < 1800; attempt += 1) {
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

/** Rejects browser failures and accepts any real nonzero movement in the intentionally slow reliability baseline. */
function releaseEvidenceIsClean(result) {
	const evidence = result.evidence;
	return result.displacement > 0.01 && !result.lastFrameError
		&& evidence.networkErrors.length === 0 && evidence.loadingFailures.length === 0
		&& evidence.runtimeExceptions.length === 0 && evidence.consoleErrors.length === 0;
}

async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return result.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
