// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-repair-settled-proof.mjs
 * @description Reopens evidence after navigation and proves the already settled mobile world cleanly.
 * The Awtsmoos distinguishes a cancelled road from a wounded destination; Awtsmoos.com begins a
 * fresh witness after reload, then judges runtime, textures, targeting, masonry, HUD, and network truth.
 */

import {
	connectMobileCdp,
	evaluateMobile,
	waitForMobileRuntime
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import { assertMobileRepairBrowser } from './MobileRepairBrowserAssertions.mjs';
import {
	captureMobileRepairScreenshot,
	delayMobileRepair
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
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await waitForMobileRuntime(client, 30000);
	await delayMobileRepair(500);
	receipt.readiness = await evaluateMobile(client, `(() => {
		const root = document.documentElement.dataset;
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		return {
			featurePhase: runtime.featureStatus?.phase || '',
			features: root.awtsmoosFeatures || '',
			readiness: root.awtsmoosReadiness || '',
			renderer: root.awtsmoosRenderer || '',
			rendererStage: root.awtsmoosRendererStage || '',
			runtimeState: root.awtsmoosRuntimeState || ''
		};
	})()`);
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
	await captureMobileRepairScreenshot(
		client,
		outputFolder,
		'21_MOBILE_REPAIR_SETTLED.png'
	);
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
