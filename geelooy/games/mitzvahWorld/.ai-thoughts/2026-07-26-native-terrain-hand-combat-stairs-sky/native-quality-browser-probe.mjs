// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-quality-browser-probe.mjs
 * @description Proves native terrain, settled loading, hand casting, mercy, mission, stairs, and sun.
 * The Awtsmoos reveals correction through the living mobile WebGL world; Awtsmoos.com records
 * becoming, action, ascent, and atmosphere before accepting any finite claim of completion.
 */

import {
	connectMobileCdp
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	captureMobileScreenshot,
	clearIsolatedMobileState
} from '../2026-07-26-mobile-gameplay-polish/MobileGameplayProbeRuntime.mjs';
import {
	assertNativeQualityReceipt
} from './NativeQualityBrowserAssertions.mjs';
import {
	inspectNativeQualityRuntime
} from './NativeQualityBrowserRuntime.mjs';
import {
	traverseNativeQualityStairs
} from './NativeQualityBrowserStairs.mjs';
import {
	focusProceduralSun
} from './NativeQualityBrowserSun.mjs';
import {
	recordNativeQualityReadiness
} from './NativeQualityReadinessTimeline.mjs';

const port = Number(process.argv[2] || 9248);
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
	receipt.readiness = await recordNativeQualityReadiness(client, 90000);
	receipt.runtime = await inspectNativeQualityRuntime(client);
	receipt.stairs = await traverseNativeQualityStairs(client);
	await captureMobileScreenshot(
		client,
		new URL('./', import.meta.url),
		'10_live_native_gameplay.png'
	);
	receipt.sun = await focusProceduralSun(client);
	await new Promise(resolve => setTimeout(resolve, 700));
	await captureMobileScreenshot(
		client,
		new URL('./', import.meta.url),
		'10_live_procedural_sun.png'
	);
	receipt.browserEvidence = client.evidence;
	assertNativeQualityReceipt(receipt);
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
