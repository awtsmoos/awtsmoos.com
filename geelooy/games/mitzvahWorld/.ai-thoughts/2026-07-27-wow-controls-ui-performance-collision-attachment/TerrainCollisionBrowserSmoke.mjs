// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainCollisionBrowserSmoke.mjs
 * @description Proves full visual terrain, bounded collision, readiness, and browser health.
 * The Awtsmoos preserves visible creation while Awtsmoos.com measures fewer collision vessels
 * in the living WebGL world without accepting console, exception, HTTP, or request failure wounds.
 */

import assert from 'node:assert/strict';
import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	recordNativeQualityReadiness
} from '../2026-07-26-native-terrain-hand-combat-stairs-sky/NativeQualityReadinessTimeline.mjs';

const port = Number(process.argv[2] || 9256);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await client.send('Runtime.enable');
	await client.send('Page.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 720,
		mobile: false,
		width: 1280
	});
	await client.send('Page.reload', { ignoreCache: true });
	receipt.readiness = await recordNativeQualityReadiness(client, 120000);
	receipt.terrain = await evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const stats = runtime.terrain.stats || runtime.terrain.evidence || {};
		return {
			colliderCount: runtime.terrain.colliders?.length || stats.colliderTriangles,
			colliderTriangles: stats.colliderTriangles,
			collisionCellWidth: stats.collisionCellWidth,
			collisionSteps: stats.collisionSteps,
			size: stats.size || runtime.terrain.size,
			steps: stats.steps || runtime.terrain.steps,
			visualTriangles: stats.visualTriangles,
			vertexCount: stats.vertexCount
		};
	})()`);
	receipt.browserEvidence = client.evidence;
	assert.equal(receipt.readiness.final.readiness, 'ready');
	assert.equal(receipt.readiness.final.rendererStage, 'rich-ready');
	assert.equal(receipt.terrain.size, 360);
	assert.equal(receipt.terrain.steps, 120);
	assert.equal(receipt.terrain.visualTriangles, 28800);
	assert.equal(receipt.terrain.collisionSteps, 60);
	assert.equal(receipt.terrain.collisionCellWidth, 6);
	assert.equal(receipt.terrain.colliderTriangles, 7200);
	assert.equal(receipt.terrain.colliderCount, 7200);
	assert.deepEqual(receipt.browserEvidence.consoleErrors, []);
	assert.deepEqual(receipt.browserEvidence.exceptions, []);
	assert.deepEqual(receipt.browserEvidence.httpErrors, []);
	assert.deepEqual(receipt.browserEvidence.requestFailures, []);
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
