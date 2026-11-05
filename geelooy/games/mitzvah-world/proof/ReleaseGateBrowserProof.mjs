// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReleaseGateBrowserProof.mjs
 * @description Runs the real public release gate in isolated Chrome and prints one bounded certification receipt with Chossid stage timing.
 * The Awtsmoos lets browser, world, Chossid, frame, grass, and chunk stand as witnesses instead of imagined green lights;
 * Awtsmoos.com gathers their testimony through DevTools so every release failure keeps its exact finite name and measured importer chamber in sight.
 */

import { fileURLToPath } from 'node:url';
import { startBrowserProof } from '../experiments/Awtsmoos/src/test/browser/BrowserProofProcess.mjs';
import { createCdpProofSession } from './CdpProofSession.mjs';
import { delay, enterSinglePlayer } from './MobileGameplayCdp.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const owner = await startBrowserProof(repositoryRoot);
let proof = null;
let failure = null;

try {
	proof = await createCdpProofSession(owner.cdpPort);
	const { command } = proof;
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await command(`${domain}.enable`);
	await prepareProofCache(command);
	await command('Emulation.setFocusEmulationEnabled', { enabled: true });
	await command('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 720,
		mobile: false,
		screenHeight: 720,
		screenWidth: 1280,
		width: 1280
	});
	const url = `${owner.baseUrl}/geelooy/games/mitzvahWorld/index.html?releaseGate=1&proof=${Date.now()}`;
	await command('Page.navigate', { url });
	await command('Page.bringToFront');
	await enterSinglePlayer(command, 'living-village');
	const page = await waitForReleaseTerminal(command);
	const receipt = assess(page, proof.evidence);
	console.log(`RELEASE_GATE_BROWSER_RECEIPT ${JSON.stringify(receipt)}`);
	if (!receipt.accepted) throw new Error(`RELEASE_GATE_BROWSER_REJECTED ${JSON.stringify(receipt)}`);
} catch (error) {
	failure = error;
	console.error(error?.stack || error);
} finally {
	await proof?.close().catch(() => {});
	await owner.stop().catch(() => {});
}

if (failure) process.exitCode = 1;

async function waitForReleaseTerminal(command) {
	for (let attempt = 0; attempt < 900; attempt += 1) {
		const value = await evaluate(command, releaseReceiptExpression());
		if (value?.state === 'passed' || value?.state === 'failed') return value;
		if (value?.launchFailure) return value;
		await delay(100);
	}
	throw new Error(`RELEASE_GATE_TERMINAL_TIMEOUT ${JSON.stringify(await evaluate(command, releaseReceiptExpression()))}`);
}

function releaseReceiptExpression() {
	return `(() => {
		const session = globalThis.AwtsmoosMitzvahWorldReleaseGateSession;
		return {
			state: session?.state || null,
			gate: globalThis.AwtsmoosMitzvahWorldReleaseGateEvidence || null,
			essential: globalThis.AwtsmoosMitzvahWorldEssentialBoot || null,
			chossidTiming: globalThis.AwtsmoosMitzvahWorldCanonicalChossidTiming || null,
			launchFailure: globalThis.AwtsmoosMitzvahWorldReleaseGateLaunchFailure || null,
			world: globalThis.AwtsmoosMitzvahWorld?.runtime?.worldExperience?.id || null,
			host: navigator.userAgent
		};
	})()`;
}

function assess(page, evidence) {
	const browserClean = ['consoleErrors', 'loadingFailures', 'networkErrors', 'runtimeExceptions']
		.every(key => evidence[key].length === 0);
	const accepted = page?.state === 'passed'
		&& page?.gate?.certified === true
		&& page?.essential?.certified === true
		&& !page?.launchFailure
		&& browserClean;
	return { accepted, browserClean, evidence, page };
}

async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', {
		awaitPromise: true,
		expression,
		returnByValue: true
	});
	return result.result.value;
}
