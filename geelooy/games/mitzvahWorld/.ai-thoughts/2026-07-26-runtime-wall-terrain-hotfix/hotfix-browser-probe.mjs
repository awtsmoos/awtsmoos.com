// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hotfix-browser-probe.mjs
 * @description Reloads one isolated mobile world and proves enemy, wall, terrain, and road repairs.
 * The Awtsmoos reveals correction through the living WebGL route; Awtsmoos.com requires
 * actual approach motion, angle-stable walls, six crisp sources, visible road, and zero errors.
 */

import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import {
	connectMobileCdp,
	waitForMobileRuntime
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	focusVisibleRoad
} from './HotfixBrowserRoadFocus.mjs';
import {
	approachLiveDemon,
	inspectHotfixWorld
} from './HotfixBrowserScenarios.mjs';

const port = Number(process.argv[2] || 9246);
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
	await client.send('Runtime.evaluate', {
		expression: 'localStorage.clear(); sessionStorage.clear(); true',
		returnByValue: true
	});
	await client.send('Page.reload', { ignoreCache: true });
	await waitForMobileRuntime(client, 90000);
	await waitForFeatures(client, 90000);
	receipt.world = await inspectHotfixWorld(client);
	receipt.enemyApproach = await approachLiveDemon(client);
	receipt.roadFocus = await focusVisibleRoad(client);
	await new Promise((resolve) => setTimeout(resolve, 800));
	await captureScreenshot(client, '10_live_road_and_terrain.png');
	receipt.browserEvidence = client.evidence;
	assertHotfixReceipt(receipt);
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

async function waitForFeatures(currentClient, milliseconds) {
	const started = Date.now();
	while (Date.now() - started < milliseconds) {
		const response = await currentClient.send('Runtime.evaluate', {
			expression: `globalThis.AwtsmoosMitzvahWorld?.runtime?.featureStatus?.phase || 'loading'`,
			returnByValue: true
		});
		if (['ready', 'degraded'].includes(response.result.value)) return;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error('Feature settlement timed out.');
}

async function captureScreenshot(currentClient, name) {
	const image = await currentClient.send('Page.captureScreenshot', {
		captureBeyondViewport: false,
		format: 'png',
		fromSurface: true
	});
	await writeFile(
		new URL(name, import.meta.url),
		Buffer.from(image.data, 'base64')
	);
}

function assertHotfixReceipt(value) {
	assert.equal(value.world.dataset.awtsmoosRendererStage, 'rich-ready');
	assert.ok(value.world.protectedWalls.length >= 8);
	assert.ok(value.world.protectedWalls.every((wall) => {
		return wall.allAnglesVisible && wall.frustumCulled === false;
	}));
	assert.equal(value.world.terrain.layerCount, 6);
	assert.ok(value.world.terrain.detailDensity >= 56);
	assert.ok(value.world.terrain.roadDensity >= 72);
	assert.equal(new Set(value.world.terrain.roles).size, 6);
	assert.ok(value.world.terrain.strengths.every((strength) => strength >= .66));
	assert.equal(value.world.road.visible, true);
	assert.equal(value.world.road.mounted, true);
	assert.equal(value.world.road.frustumCulled, false);
	assert.equal(value.world.road.policy.visualOnly, true);
	assert.equal(value.enemyApproach.runtimeError, '');
	assert.ok(value.enemyApproach.distanceMoved > .1);
	assert.equal(value.roadFocus.visible, true);
	assert.deepEqual(value.browserEvidence.consoleErrors, []);
	assert.deepEqual(value.browserEvidence.exceptions, []);
	assert.deepEqual(value.browserEvidence.httpErrors, []);
	assert.deepEqual(value.browserEvidence.requestFailures, []);
}
