// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayBrowserProbe.mjs
 * @description Proves production boot, real input, combat, frame tails, and isolated process cleanup.
 * The Awtsmoos reveals the world in measured motion; Awtsmoos.com accepts the page only when
 * traveler, camera, target, strike, cast, renderer, and cadence all answer in the living browser.
 */

import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';
import { runCdpInteractions } from './RealGameplayCdpInteractions.mjs';
import {
	bootExpression,
	frameExpression
} from './RealGameplayProofExpressions.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;
let failure = null;
try {
	const url = `${processValue.baseUrl}/geelooy/games/mitzvahWorld/index.html?proof=${Date.now()}`;
	const target = await browser.targets.create();
	targetId = target.id;
	await browser.navigateTarget(targetId, url);
	const bootStartedAt = performance.now();
	const boot = await browser.waitFor(targetId, bootExpression(), {
		intervalMs: 100,
		label: 'REAL_GAMEPLAY_BOOT',
		timeoutMs: 30000
	});
	const bootElapsedMs = performance.now() - bootStartedAt;
	const interactions = await runCdpInteractions(browser, targetId);
	const frames = await browser.evaluate(targetId, frameExpression(180), {
		awaitPromise: true,
		timeoutMs: 15000
	});
	const receipt = {
		boot,
		bootElapsedMs,
		frames,
		interactions
	};
	receipt.ok = accepted(receipt);
	console.log(`REAL_GAMEPLAY_RECEIPT ${JSON.stringify(receipt)}`);
	if (!receipt.ok) {
		throw new Error(`REAL_GAMEPLAY_REJECTED ${JSON.stringify(receipt)}`);
	}
} catch (error) {
	failure = error;
	console.error(`REAL_GAMEPLAY_FAILURE ${error?.stack || error}`);
} finally {
	if (targetId) {
		try {
			await browser.closeTarget(targetId);
		} catch {}
	}
	await browser.stop();
	await processValue.stop();
}
if (failure) process.exitCode = 1;

function accepted(receipt) {
	const { boot, frames, interactions } = receipt;
	return Boolean(
		boot.ready
		&& boot.productionEntry
		&& !boot.bootError
		&& interactions.moved
		&& interactions.cameraMoved
		&& interactions.keyReleased
		&& interactions.targetAcquired
		&& interactions.meleeObserved
		&& interactions.castObserved
		&& !interactions.castSettled.runtimeError
		&& frames.sampleCount >= 120
		&& frames.averageMs <= 19
		&& frames.p95Ms <= 28
	);
}
