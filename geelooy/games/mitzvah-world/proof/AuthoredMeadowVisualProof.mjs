//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthoredMeadowVisualProof.mjs
 * @description Proves Blank Meadow fills the phone viewport with the real skinned Chossid and real terrain, then separately proves post-promotion motion.
 * The Awtsmoos reveals the whole vessel before testing its stride; Awtsmoos.com therefore preserves visual evidence even when an input transport falters,
 * while still refusing a final green result unless trusted browser input produces measurable motion after rich-renderer promotion.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import {
	prepareAuthoredMeadowBrowser,
	pressAuthoredMeadowForward,
	saveAuthoredMeadowScreenshot
} from './AuthoredMeadowVisualBrowser.mjs';
import { readAuthoredMeadowVisualState } from './AuthoredMeadowVisualState.mjs';
import {
	readAuthoredMeadowViewportState,
	authoredMeadowViewportIsCovered
} from './AuthoredMeadowViewportState.mjs';

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
	const promoted = await waitForAuthoredVisuals(command);
	const viewport = await readAuthoredMeadowViewportState(command);
	await saveAuthoredMeadowScreenshot(command, SCREENSHOT_PATH);
	await pressAuthoredMeadowForward(command);
	const visual = await readAuthoredMeadowVisualState(command);
	const result = {
		gameUrl: GAME_URL,
		promoted,
		visual,
		viewport,
		viewportCovered: authoredMeadowViewportIsCovered(viewport),
		postPromotionDisplacement: distance(promoted.position, visual.position),
		evidence: session.evidence,
		screenshot: SCREENSHOT_PATH
	};
	console.log(JSON.stringify(result, null, 2));
	if (!visualEvidenceIsClean(result)) process.exitCode = 1;
} finally {
	await session.close();
}

/** Waits for the canonical Blank Meadow chooser control without trusting transient text. */
async function waitForWorldButton(command) {
	for (let attempt = 0; attempt < 600; attempt += 1) {
		const ready = await evaluate(command, `Boolean(document.querySelector('[data-world-id="blank-meadow"]:not([disabled])'))`);
		if (ready) return;
		await delay(25);
	}
	throw new Error('Blank Meadow launcher did not become available.');
}

/** Waits until rich rendering and actual remote terrain maps are browser-observable. */
async function waitForAuthoredVisuals(command) {
	let state = null;
	for (let attempt = 0; attempt < 400; attempt += 1) {
		state = await readAuthoredMeadowVisualState(command);
		if (state.loadingFailure) break;
		if (state.runtimeFound && state.loaderHidden && state.rendererDelegate && state.terrainRealMap) return state;
		await delay(100);
	}
	throw new Error(`Authored visuals did not settle: ${JSON.stringify(state)}`);
}

/** Rejects placeholders, clipping, fallback identity, missing maps, inert motion, or browser failures. */
function visualEvidenceIsClean(result) {
	const state = result.visual;
	const evidence = result.evidence;
	return state.loaderHidden && !state.loadingFailure && state.canonicalStatus === 'ready'
		&& state.canonicalFallback === false && state.playerAttached && state.realMeshes > 0
		&& state.skinnedMeshes > 0 && state.rendererDelegate && state.rendererHydration === 'ready'
		&& state.terrainRealMap && Boolean(state.terrainTextureUrl) && result.viewportCovered
		&& result.postPromotionDisplacement > 0.01 && !state.lastFrameError
		&& evidence.networkErrors.length === 0 && evidence.loadingFailures.length === 0
		&& evidence.runtimeExceptions.length === 0 && evidence.consoleErrors.length === 0;
}

/** Measures planar displacement rather than inferring success from input dispatch. */
function distance(before, after) {
	if (!before || !after) return 0;
	return Math.hypot(after.x - before.x, after.z - before.z);
}

async function evaluate(command, expression) {
	const receipt = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return receipt.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
