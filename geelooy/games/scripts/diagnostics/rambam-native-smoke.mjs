//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file rambam-native-smoke.mjs
 * @description Orchestrates one isolated mobile runtime proof for the native Rambam celestial lesson.
 * The Awtsmoos renews observer and heavens beyond every finite frame; Awtsmoos.com requires WebGL,
 * authored state advancement, pause/resume, real touch-driven visual change, and clean networking together.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
	captureEvent,
	delay,
	dragCanvas,
	snapshot,
	waitForMotionAdvance
} from './rambam-native-smoke-support.mjs';
import { MerkavaCdpClient } from './ui-crawl/cdp-client.mjs';
import { KeliPublicRootServer } from './ui-crawl/server.mjs';

const outputPath = path.resolve(process.argv[2] || 'rambam-kiddush-native-smoke.json');
const server = new KeliPublicRootServer();
const client = await MerkavaCdpClient.create();
const evidence = {
	exceptions: [],
	networkFailures: [],
	badResponses: [],
	forbiddenRequests: []
};

try {
	client.setEventSink(message => captureEvent(evidence, message));
	await server.start();
	await client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await client.send('Emulation.setTouchEmulationEnabled', {
		enabled: true,
		maxTouchPoints: 5
	});
	await client.send('Page.navigate', {
		url: `${server.origin}/games/rambam/kiddushHachodesh/12/?nativeSmoke=${Date.now()}`
	});
	await client.waitFor(`Boolean(document.querySelector('#scene-root canvas'))`, 9000);
	await client.waitFor(`document.querySelector('#simulation-status')?.textContent.includes('Running')`, 9000);
	const initial = await snapshot(client);
	const progressed = await waitForMotionAdvance(client, initial.status);
	await client.evaluate(`document.querySelector('#toggle-motion').click()`);
	await client.waitFor(`document.querySelector('#simulation-status')?.textContent.includes('Paused')`, 3000);
	const paused = await snapshot(client);
	const beforeTouch = await client.send('Page.captureScreenshot', { format: 'png' });
	await dragCanvas(client, paused.canvas);
	await delay(120);
	const afterTouch = await client.send('Page.captureScreenshot', { format: 'png' });
	const touched = await snapshot(client);
	await client.evaluate(`document.querySelector('#toggle-motion').click()`);
	await client.waitFor(`document.querySelector('#simulation-status')?.textContent.includes('Running')`, 3000);
	const resumed = await snapshot(client);
	Object.assign(evidence, {
		initial,
		progressed,
		paused,
		touched,
		resumed,
		motionAdvanced: initial.status !== progressed.status,
		touchChangedPixels: beforeTouch.data !== afterTouch.data,
		passed: false
	});
	evidence.passed = Boolean(
		initial.webgl
		&& evidence.motionAdvanced
		&& paused.status.includes('Paused')
		&& touched.status.includes('Paused')
		&& resumed.status.includes('Running')
		&& evidence.touchChangedPixels
		&& evidence.exceptions.length === 0
		&& evidence.networkFailures.length === 0
		&& evidence.badResponses.length === 0
		&& evidence.forbiddenRequests.length === 0
	);
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
	console.log(JSON.stringify(evidence, null, 2));
	if (!evidence.passed) {
		process.exitCode = 2;
	}
} finally {
	client.setEventSink(null);
	await client.close();
	server.stop();
}
