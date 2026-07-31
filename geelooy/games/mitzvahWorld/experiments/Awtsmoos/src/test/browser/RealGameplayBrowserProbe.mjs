// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayBrowserProbe.mjs
 * @description Proves focused production boot, authoritative combat, frame tails, and cleanup.
 * The Awtsmoos reveals the world in measured foreground motion; Awtsmoos.com fixes the proof
 * viewport and focus before navigation so buffer, GPU, strike, cast, damage, and cadence agree.
 */

import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';
import { runCdpInteractions } from './RealGameplayCdpInteractions.mjs';
import {
	performanceExpression,
	resizeReceiptExpression
} from './RealGameplayPerformanceExpression.mjs';
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
	const session = await browser.session(targetId);
	await configureForegroundPage(session);
	await browser.navigateTarget(targetId, url);
	await session.send('Page.bringToFront');
	const bootStartedAt = performance.now();
	const boot = await browser.waitFor(targetId, bootExpression(), {
		intervalMs: 100,
		label: 'REAL_GAMEPLAY_BOOT',
		timeoutMs: 60000
	});
	const bootElapsedMs = performance.now() - bootStartedAt;
	const viewport = await browser.evaluate(targetId, resizeReceiptExpression());
	const interactions = await runCdpInteractions(browser, targetId);
	const frames = await browser.evaluate(targetId, frameExpression(180), {
		awaitPromise: true,
		timeoutMs: 15000
	});
	const diagnostics = await browser.evaluate(targetId, performanceExpression());
	const receipt = { boot, bootElapsedMs, diagnostics, frames, interactions, viewport };
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

async function configureForegroundPage(session) {
	await session.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	await session.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 720,
		mobile: false,
		screenHeight: 720,
		screenWidth: 1280,
		width: 1280
	});
	await session.send('Page.bringToFront');
}

function accepted(receipt) {
	const { boot, frames, interactions, viewport } = receipt;
	return Boolean(
		boot.ready
		&& boot.productionEntry
		&& !boot.bootError
		&& viewport.renderWidth === viewport.cssWidth
		&& viewport.renderHeight === viewport.cssHeight
		&& interactions.moved
		&& interactions.cameraMoved
		&& interactions.keyReleased
		&& interactions.targetAcquired
		&& interactions.meleeFixture?.applied
		&& interactions.castFixture?.applied
		&& interactions.meleeObserved
		&& interactions.castObserved
		&& interactions.damageObserved
		&& !interactions.castSettled.runtimeError
		&& frames.sampleCount >= 120
		&& frames.averageMs <= 19
		&& frames.p95Ms <= 28
	);
}
