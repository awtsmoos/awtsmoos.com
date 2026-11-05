//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FailureInjectionProof.mjs
 * @description Blocks one witnessed production dependency and proves finite essential failure or safe deferred degradation.
 * The Awtsmoos gives each test one real boundary and one real witness; Awtsmoos.com waits for the named request itself,
 * then judges failure or continued motion so deferred garments cannot escape Gevurah merely by arriving after first control.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import { pressAuthoredMeadowForward } from './AuthoredMeadowVisualBrowser.mjs';
import { readAuthoredMeadowVisualState } from './AuthoredMeadowVisualState.mjs';
import { readFailureInjectionState } from './FailureInjectionState.mjs';
import { waitForBlockedTargets } from './FailureInjectionObservation.mjs';
import { failureInjectionScenarios } from './FailureInjectionScenarioCatalog.mjs';

const scenario = process.env.MITZVAH_WORLD_FAILURE_SCENARIO || 'chossid';
const port = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const base = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:5183';
const definition = failureInjectionScenarios()[scenario];
if (!definition) throw new Error(`Unknown failure scenario: ${scenario}`);
const session = await createCdpProofSession(port);

try {
	const command = session.command;
	await prepareNetworkBoundary(command, definition.blockedUrls);
	await command('Page.navigate', { url: `${base}/games/mitzvahWorld/index.html?failure=${scenario}-${Date.now()}` });
	await waitForWorldButton(command);
	await evaluate(command, `document.querySelector('[data-world-id="blank-meadow"]').click(); true`);
	let state = await waitForScenario(command, definition);
	const observation = await waitForBlockedTargets(session.evidence, definition);
	state = await readFailureInjectionState(command);
	const supplemental = definition.requiresMovement ? await movementReceipt(command) : null;
	const accepted = observation.valid && definition.accept(state, supplemental);
	console.log(JSON.stringify({
		scenario,
		blockedUrls: definition.blockedUrls,
		observation,
		state,
		supplemental,
		evidence: session.evidence,
		accepted
	}, null, 2));
	if (!accepted) process.exitCode = 1;
} finally {
	await session.close();
}

/** Makes the dependency experiment cold and observable before page navigation. */
async function prepareNetworkBoundary(command, blockedUrls) {
	await command('Network.enable');
	await command('Network.setCacheDisabled', { cacheDisabled: true });
	await command('Network.setBypassServiceWorker', { bypass: true });
	await command('Network.setBlockedURLs', { urls: blockedUrls });
}

async function movementReceipt(command) {
	const before = await readAuthoredMeadowVisualState(command);
	await pressAuthoredMeadowForward(command);
	const after = await readAuthoredMeadowVisualState(command);
	return { before: before.position, after: after.position, movement: distance(before.position, after.position) };
}

async function waitForWorldButton(command) {
	for (let attempt = 0; attempt < 600; attempt += 1) {
		if (await evaluate(command, `Boolean(document.querySelector('[data-world-id="blank-meadow"]:not([disabled])'))`)) return;
		await delay(25);
	}
	throw new Error('Blank Meadow chooser did not become available.');
}

async function waitForScenario(command, definition) {
	let state = null;
	for (let attempt = 0; attempt < 240; attempt += 1) {
		state = await readFailureInjectionState(command);
		if (definition.settled(state)) return state;
		await delay(100);
	}
	return state;
}

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
