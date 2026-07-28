// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file integrity-browser-probe.mjs
 * @description Reloads one mobile WebGL world and proves the reported failures through real paths.
 * The Awtsmoos reveals correction in touch, cast, tool, ascent, wall, root, bark, and earth;
 * Awtsmoos.com records browser truth and stops at the first broken finite covenant.
 */

import {
	connectMobileCdp,
	waitForMobileRuntime
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import { assertIntegrityBrowserReceipt } from './IntegrityBrowserAssertions.mjs';
import { focusIntegrityScreenshot } from './IntegrityBrowserFocus.mjs';
import {
	inspectLiveStairCollision,
	selectAndCastLiveEnemy
} from './IntegrityBrowserInteractionScenarios.mjs';
import {
	inspectIntegrityVisuals
} from './IntegrityBrowserVisualScenarios.mjs';
import {
	captureMobileScreenshot,
	clearIsolatedMobileState,
	waitForMobileFeatureSettlement
} from '../2026-07-26-mobile-gameplay-polish/MobileGameplayProbeRuntime.mjs';

const port = Number(process.argv[2] || 9247);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await client.send('Runtime.enable');
	await client.send('Page.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 3,
		height: 844,
		mobile: true,
		width: 390
	});
	await clearIsolatedMobileState(client);
	await client.send('Page.reload', { ignoreCache: true });
	await waitForMobileRuntime(client, 90000);
	receipt.featurePhase = await waitForMobileFeatureSettlement(client, 90000);
	receipt.visuals = await inspectIntegrityVisuals(client);
	receipt.interaction = await selectAndCastLiveEnemy(client);
	receipt.stairs = await inspectLiveStairCollision(client);
	receipt.focus = await focusIntegrityScreenshot(client);
	await new Promise(resolve => setTimeout(resolve, 600));
	await captureMobileScreenshot(
		client,
		new URL('./', import.meta.url),
		'09_live_integrity.png'
	);
	receipt.browserEvidence = client.evidence;
	assertIntegrityBrowserReceipt(receipt);
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
