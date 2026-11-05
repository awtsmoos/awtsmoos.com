// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayCostExperiment.mjs
 * @description Measures browser cadence, full gameplay, rendering, and world updates in one clean session.
 * The Awtsmoos remains whole while each finite labor rests for one measured breath; Awtsmoos.com
 * restores every method before cleanup so evidence is gained without turning diagnosis into deletion.
 */

import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';
import {
	disableRenderExpression,
	disableWorldSystemsExpression,
	restoreExperimentExpression,
	runtimeShapeExpression
} from './RealGameplayCostExperimentExpressions.mjs';
import {
	bootExpression,
	frameExpression
} from './RealGameplayProofExpressions.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;
try {
	const target = await browser.targets.create();
	targetId = target.id;
	const session = await browser.session(targetId);
	await configurePage(session);
	const blank = await sample(browser, targetId);
	const url = `${processValue.baseUrl}/geelooy/games/mitzvahWorld/index.html?cost=${Date.now()}`;
	await browser.navigateTarget(targetId, url);
	await session.send('Page.bringToFront');
	const boot = await browser.waitFor(targetId, bootExpression(), {
		intervalMs: 100,
		label: 'COST_EXPERIMENT_BOOT',
		timeoutMs: 60000
	});
	const shape = await browser.evaluate(targetId, runtimeShapeExpression());
	const full = await sample(browser, targetId);
	await browser.evaluate(targetId, disableRenderExpression());
	const withoutRender = await sample(browser, targetId);
	await browser.evaluate(targetId, restoreExperimentExpression());
	await browser.evaluate(targetId, disableWorldSystemsExpression());
	const withoutWorldSystems = await sample(browser, targetId);
	await browser.evaluate(targetId, disableRenderExpression());
	const simulationOnly = await sample(browser, targetId);
	await browser.evaluate(targetId, restoreExperimentExpression());
	console.log(`REAL_GAMEPLAY_COSTS ${JSON.stringify({
		blank,
		boot,
		full,
		shape,
		simulationOnly,
		withoutRender,
		withoutWorldSystems
	})}`);
} finally {
	if (targetId) {
		try {
			await browser.closeTarget(targetId);
		} catch {}
	}
	await browser.stop();
	await processValue.stop();
}

function sample(browser, targetId) {
	return browser.evaluate(targetId, frameExpression(120), {
		awaitPromise: true,
		timeoutMs: 15000
	});
}

async function configurePage(session) {
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
