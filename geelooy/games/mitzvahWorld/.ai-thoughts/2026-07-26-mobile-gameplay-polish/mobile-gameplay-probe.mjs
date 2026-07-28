// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-gameplay-probe.mjs
 * @description Reloads one clean mobile world and executes every requested live interaction.
 * The Awtsmoos reveals one browser truth without stale memory; Awtsmoos.com refuses
 * completion until each visual, gameplay, teaching, loot, and network covenant passes.
 */

import {
	connectMobileCdp,
	waitForMobileRuntime
} from './MobileCdpClient.mjs';
import { assertMobileGameplayReceipt } from './MobileGameplayProbeAssertions.mjs';
import {
	captureMobileScreenshot,
	clearIsolatedMobileState,
	waitForMobileFeatureSettlement
} from './MobileGameplayProbeRuntime.mjs';
import {
	acceptAndProgressShlichus,
	inspectMobileCore,
	inspectReleasedFacing,
	moveTeachingToBook,
	openCorpseLoot,
	openShlichusOffer,
	takeAndLootAll
} from './MobileGameplayProbeScenarios.mjs';

const port = Number(process.argv[2] || 9245);
const route = process.argv[3] || 'http://localhost:8080/games/mitzvahWorld/';
const outputFolder = new URL('./', import.meta.url);
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
	receipt.core = await inspectMobileCore(client);
	receipt.facing = await inspectReleasedFacing(client);
	receipt.shlichusOffer = await openShlichusOffer(client);
	await captureMobileScreenshot(client, outputFolder, '11_mobile_shlichus_offer.png');
	receipt.shlichusProgress = await acceptAndProgressShlichus(client);
	await captureMobileScreenshot(client, outputFolder, '11_mobile_shlichus_progress.png');
	receipt.teaching = await moveTeachingToBook(client);
	receipt.lootOpen = await openCorpseLoot(client);
	await captureMobileScreenshot(client, outputFolder, '11_mobile_corpse_loot.png');
	receipt.lootCompletion = await takeAndLootAll(client);
	receipt.browserEvidence = client.evidence;
	assertMobileGameplayReceipt(receipt);
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
