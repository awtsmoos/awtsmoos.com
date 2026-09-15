//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthoredMeadowVisualProof.mjs
 * @description Proves Blank Meadow promotes from fast bootstrap play into the real skinned Chossid renderer and remote grass texture.
 * The Awtsmoos lets first control arrive through a small vessel and then clothes Malchus in truthful authored form;
 * Awtsmoos.com records visual truth independently from input testimony so a Chrome input stall can never erase renderer evidence.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import {
	prepareAuthoredMeadowBrowser,
	saveAuthoredMeadowScreenshot
} from './AuthoredMeadowVisualBrowser.mjs';
import { readAuthoredMeadowVisualState } from './AuthoredMeadowVisualState.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:8910';
const GAME_URL = `${BASE_URL}/games/mitzvahWorld/index.html?authored=${Date.now()}`;
const SCREENSHOT_PATH = process.env.MITZVAH_WORLD_VISUAL_SCREENSHOT || '/tmp/mitzvah-authored-meadow-proof.png';
const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	await prepareAuthoredMeadowBrowser(command);
	await command('Page.navigate', { url: GAME_URL });
	await waitForWorldButton(command);
	await evaluate(command, `document.querySelector('[data-world-id="blank-meadow"]').click(); true`);
	const visual = await waitForAuthoredVisuals(command);
	await saveAuthoredMeadowScreenshot(command, SCREENSHOT_PATH);
	const result = {
		gameUrl: GAME_URL,
		visual,
		evidence: session.evidence,
		screenshot: SCREENSHOT_PATH
	};
	console.log(JSON.stringify(result, null, 2));
	if (!visualEvidenceIsClean(result)) process.exitCode = 1;
} finally {
	await session.close();
}

/** Waits for the canonical Blank Meadow control without relying on transient text. */
async function waitForWorldButton(command) {
	for (let attempt = 0; attempt < 600; attempt += 1) {
		const ready = await evaluate(
			command,
			`Boolean(document.querySelector('[data-world-id="blank-meadow"]:not([disabled])'))`
		);
		if (ready) return;
		await delay(25);
	}
	throw new Error('Blank Meadow launcher did not become available.');
}

/** Waits for post-play renderer and terrain garments to become browser-observable. */
async function waitForAuthoredVisuals(command) {
	let state = null;
	for (let attempt = 0; attempt < 400; attempt += 1) {
		state = await readAuthoredMeadowVisualState(command);
		if (state.loadingFailure) break;
		if (state.runtimeFound && state.loaderHidden && state.rendererDelegate && state.terrainRealMap) {
			return state;
		}
		await delay(100);
	}
	throw new Error(`Authored visuals did not settle: ${JSON.stringify(state)}`);
}

/** Rejects any return to placeholder rendering, fallback identity, missing terrain maps, or browser failure. */
function visualEvidenceIsClean(result) {
	const state = result.visual;
	const evidence = result.evidence;
	return state.loaderHidden && !state.loadingFailure && state.canonicalStatus === 'ready'
		&& state.canonicalFallback === false && state.playerAttached && state.realMeshes > 0
		&& state.skinnedMeshes > 0 && state.rendererDelegate && state.rendererHydration === 'ready'
		&& state.terrainRealMap && Boolean(state.terrainTextureUrl) && !state.lastFrameError
		&& evidence.networkErrors.length === 0 && evidence.loadingFailures.length === 0
		&& evidence.runtimeExceptions.length === 0 && evidence.consoleErrors.length === 0;
}

async function evaluate(command, expression) {
	const receipt = await command('Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true
	});
	return receipt.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
