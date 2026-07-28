// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file live-mobile-repair-proof.mjs
 * @description Boots one isolated portrait world, then proves its settled UI and world interactions.
 * The Awtsmoos separates navigation noise from living truth; Awtsmoos.com reloads with one witness,
 * reconnects cleanly, performs real actions, captures two frames, and judges every settled receipt.
 */

import {
	connectMobileCdp,
	waitForMobileRuntime
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	clearIsolatedMobileState,
	waitForMobileFeatureSettlement
} from '../2026-07-26-mobile-gameplay-polish/MobileGameplayProbeRuntime.mjs';
import {
	captureMobileRepairScreenshot,
	delayMobileRepair,
	prepareMobileRepairBrowser
} from '../2026-07-27-texture-selection-stairs-ui/MobileRepairBrowserSession.mjs';
import { assertLiveMobileRepair } from './LiveMobileRepairAssertions.mjs';
import { inspectLiveMobileBag } from './LiveMobileBagInspection.mjs';
import { inspectLiveMobileRepair } from './LiveMobileRepairInspection.mjs';

const port = Number(process.argv[2] || 9262);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const outputFolder = process.argv[3] || new URL('./', import.meta.url).pathname;
const boot = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await prepareMobileRepairBrowser(boot);
	await clearIsolatedMobileState(boot);
	await boot.send('Page.reload', { ignoreCache: true });
	await waitForMobileRuntime(boot, 180000);
	await waitForMobileFeatureSettlement(boot, 180000);
	boot.close();
	await delayMobileRepair(500);
	const client = await connectMobileCdp(port, route);
	try {
		await client.send('Runtime.enable');
		await client.send('Network.enable');
		await waitForMobileRuntime(client, 30000);
		receipt.readiness = await client.send('Runtime.evaluate', {
			expression: `(() => ({
				featurePhase: globalThis.AwtsmoosMitzvahWorld.runtime.featureStatus.phase,
				readiness: document.documentElement.dataset.awtsmoosReadiness,
				rendererStage: document.documentElement.dataset.awtsmoosRendererStage,
				runtimeState: document.documentElement.dataset.awtsmoosRuntimeState
			}))()`,
			returnByValue: true
		}).then(value => value.result.value);
		receipt.repair = await inspectLiveMobileRepair(client);
		await captureMobileRepairScreenshot(client, outputFolder, '15_GAMEPLAY_REPAIR.png');
		receipt.bag = await inspectLiveMobileBag(client);
		globalThis.clientForBagCapture = client;
		await client.send('Runtime.evaluate', {
			expression: `globalThis.AwtsmoosMitzvahWorld.runtime.bus.emit('inventory:open', { source: 'screenshot' })`,
			returnByValue: true
		});
		await delayMobileRepair(100);
		await captureMobileRepairScreenshot(client, outputFolder, '15_BAG_REPAIR.png');
		await client.send('Runtime.evaluate', {
			expression: `document.querySelector('.Awtsmoos-inventory-panel [data-close]')?.click()`,
			returnByValue: true
		});
		receipt.browserEvidence = client.evidence;
		assertLiveMobileRepair(receipt);
		receipt.ok = true;
	} finally {
		client.close();
	}
} catch (error) {
	receipt.error = { message: error?.message || String(error), stack: error?.stack || '' };
	process.exitCode = 1;
} finally {
	try { boot.close(); } catch {}
	console.log(JSON.stringify(receipt, null, 2));
}
