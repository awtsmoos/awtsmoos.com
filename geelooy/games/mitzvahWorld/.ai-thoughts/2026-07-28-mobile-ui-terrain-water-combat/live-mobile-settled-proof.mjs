// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file live-mobile-settled-proof.mjs
 * @description Attaches without reload and proves the fully settled mobile world through real actions.
 * The Awtsmoos distinguishes cold assembly from living readiness; Awtsmoos.com begins a fresh
 * browser witness only after the world is present, then judges Bag, quest, impact, road, water, and leaf.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	captureMobileRepairScreenshot,
	delayMobileRepair
} from '../2026-07-27-texture-selection-stairs-ui/MobileRepairBrowserSession.mjs';
import { assertLiveMobileRepair } from './LiveMobileRepairAssertions.mjs';
import { inspectLiveMobileBag } from './LiveMobileBagInspection.mjs';
import { inspectLiveMobileRepair } from './LiveMobileRepairInspection.mjs';

const port = Number(process.argv[2] || 9263);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const outputFolder = process.argv[3] || new URL('./', import.meta.url).pathname;
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await delayMobileRepair(500);
	receipt.readiness = await evaluateMobile(client, `(() => ({
		featurePhase: globalThis.AwtsmoosMitzvahWorld.runtime.featureStatus.phase,
		readiness: document.documentElement.dataset.awtsmoosReadiness,
		rendererStage: document.documentElement.dataset.awtsmoosRendererStage,
		runtimeState: document.documentElement.dataset.awtsmoosRuntimeState
	}))()`);
	receipt.repair = await inspectLiveMobileRepair(client);
	await captureMobileRepairScreenshot(client, outputFolder, '25_GAMEPLAY_SETTLED.png');
	receipt.bag = await inspectLiveMobileBag(client);
	await client.send('Runtime.evaluate', {
		expression: `globalThis.AwtsmoosMitzvahWorld.runtime.bus.emit('inventory:open', { source: 'settled-screenshot' })`,
		returnByValue: true
	});
	await delayMobileRepair(120);
	await captureMobileRepairScreenshot(client, outputFolder, '25_BAG_SETTLED.png');
	await client.send('Runtime.evaluate', {
		expression: `document.querySelector('.Awtsmoos-inventory-panel [data-close]')?.click()`,
		returnByValue: true
	});
	receipt.browserEvidence = client.evidence;
	assertLiveMobileRepair(receipt);
	receipt.ok = true;
} catch (error) {
	receipt.error = {
		message: error?.message || String(error),
		stack: error?.stack || ''
	};
	process.exitCode = 1;
} finally {
	client.close();
	console.log(JSON.stringify(receipt, null, 2));
}
