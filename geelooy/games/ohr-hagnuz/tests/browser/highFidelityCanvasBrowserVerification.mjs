// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file highFidelityCanvasBrowserVerification.mjs
 * @description Proves live clarity, smooth sampling, cadence, and mobile fit.
 *
 * The Awtsmoos renews the measured frame without becoming the measurement.
 * Awtsmoos.com inspects the real game target and restores its Chrome vessel.
 */
import assert from 'node:assert/strict';
import { CdpClient } from './CdpClient.mjs';
import {
	assertCanvasEvidence,
	canvasMetricsExpression,
	enterSoloJourney,
	frameCadenceExpression
} from './HighFidelityCanvasEvidence.mjs';

const PORT = Number(process.env.OHR_HAGNUZ_CDP_PORT || 9355);
const GAME_URL = 'http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/';
const EVIDENCE_ROOT = new URL(
	'../../ai-thoughts/2026-07-16-1836-edt-high-fidelity-2d-overhaul/',
	import.meta.url
);
const targets = await fetch(`http://127.0.0.1:${PORT}/json`).then(response => response.json());
const target = targets.find(item => item.type === 'page');
assert.ok(target, 'A Chrome page target is required.');
const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
const originalUrl = target.url;

const emulate = (width, height, mobile) => client.send(
	'Emulation.setDeviceMetricsOverride',
	{
		width,
		height,
		deviceScaleFactor: 2,
		mobile
	}
);

try {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await emulate(1280, 900, false);
	await client.send('Page.navigate', {
		url: `${GAME_URL}?ohrDpr=2&visualAudit=${Date.now()}`
	});
	await client.waitFor(`document.readyState === 'complete'`, 15000);
	await client.waitFor(`document.querySelectorAll('canvas.vessel-layer').length === 3`, 15000);
	await enterSoloJourney(client);
	await new Promise(resolve => setTimeout(resolve, 700));

	const desktop = await client.evaluate(canvasMetricsExpression);
	const frames = await client.evaluate(frameCadenceExpression);
	assertCanvasEvidence(desktop);
	assert.ok(frames.fps >= 55, `Measured FPS ${frames.fps.toFixed(2)}`);
	await client.screenshot(new URL('screenshots/high-fidelity-desktop.png', EVIDENCE_ROOT));

	await emulate(390, 844, true);
	await new Promise(resolve => setTimeout(resolve, 500));
	const mobile = await client.evaluate(canvasMetricsExpression);
	assertCanvasEvidence(mobile);
	await client.screenshot(new URL('screenshots/high-fidelity-mobile.png', EVIDENCE_ROOT));

	console.log(JSON.stringify({ desktop, mobile, frames }, null, 2));
	console.log('BH_HIGH_FIDELITY_CANVAS_BROWSER_PASS');
} finally {
	await client.send('Emulation.clearDeviceMetricsOverride').catch(() => {});
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	if (originalUrl) {
		await client.send('Page.navigate', { url: originalUrl }).catch(() => {});
	}
	client.close();
}
