// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-repair-browser-probe.mjs
 * @description Orchestrates the final live portrait proof for textures, targeting, walls, and HUD.
 * The Awtsmoos joins many browser witnesses into one honest receipt; Awtsmoos.com accepts the repair
 * only after the living page itself answers with readiness, interaction, masonry, material, and layout.
 */

import {
	connectMobileCdp,
	waitForMobileRuntime
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	clearIsolatedMobileState
} from '../2026-07-26-mobile-gameplay-polish/MobileGameplayProbeRuntime.mjs';
import {
	recordNativeQualityReadiness
} from '../2026-07-26-native-terrain-hand-combat-stairs-sky/NativeQualityReadinessTimeline.mjs';
import { assertMobileRepairBrowser } from './MobileRepairBrowserAssertions.mjs';
import {
	captureMobileRepairScreenshot,
	delayMobileRepair,
	prepareMobileRepairBrowser
} from './MobileRepairBrowserSession.mjs';
import {
	inspectMobileHouseRecovery,
	inspectMobileTargeting
} from './MobileRepairTargetHouseInspection.mjs';
import {
	inspectMobileUiAndMaterials
} from './MobileRepairUiMaterialInspection.mjs';

const port = Number(process.argv[2] || 9258);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const outputFolder = process.argv[3] || new URL('./', import.meta.url).pathname;
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await prepareMobileRepairBrowser(client);
	await clearIsolatedMobileState(client);
	await client.send('Page.reload', { ignoreCache: true });
	receipt.readiness = (
		await recordNativeQualityReadiness(client, 180000)
	).final;
	await waitForMobileRuntime(client, 180000);
	await delayMobileRepair(750);
	const targeting = await inspectMobileTargeting(client);
	const houseSurfaces = await inspectMobileHouseRecovery(client);
	await delayMobileRepair(300);
	const presentation = await inspectMobileUiAndMaterials(client);
	receipt.runtime = {
		enemies: targeting.enemies,
		houseSurfaces,
		houses: houseSurfaces.houses,
		remoteMaterials: presentation.remoteMaterials,
		targeting,
		ui: presentation.ui
	};
	await captureMobileRepairScreenshot(client, outputFolder);
	receipt.browserEvidence = client.evidence;
	assertMobileRepairBrowser(receipt);
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
