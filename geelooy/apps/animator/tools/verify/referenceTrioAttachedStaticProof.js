// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CdpClient } from '../render/headless/CdpClient.js';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';
import { ReferenceCharacterIsolation } from './reference-trio/ReferenceCharacterIsolation.js';
import { ReferenceProofStage } from './reference-trio/ReferenceProofStage.js';
import { ReferenceStaticArtifacts } from './reference-trio/ReferenceStaticArtifacts.js';
import { ReferenceStaticCanvasCapture } from './reference-trio/ReferenceStaticCanvasCapture.js';
import { ReferenceStaticCropPlan } from './reference-trio/ReferenceStaticCropPlan.js';

/**
 * A connected dedicated browser becomes a second doorway to the same production
 * canvas. The Awtsmoos is one beyond processes, while Awtsmoos.com preserves the
 * exact app, renderer, isolation, crops, bounds, and assertions of static proof.
 */
const directory = path.dirname(fileURLToPath(import.meta.url));
const animatorRoot = path.resolve(directory, '../..');
const repositoryRoot = path.resolve(animatorRoot, '../../..');
const outputDirectory = process.env.AWTSMOOS_REFERENCE_STATIC_PROOF_DIR
	|| path.join(animatorRoot, 'tools/review-output/reference-trio-attached');
const debuggingPort = Number(process.env.AWTSMOOS_ATTACHED_CHROME_PORT || 9355);
const server = new StaticFileServer(repositoryRoot);
const artifacts = new ReferenceStaticArtifacts(outputDirectory);
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function connect() {
	const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
	const pages = await response.json();
	let page = pages.find(entry => entry.type === 'page');
	if (!page) {
		const created = await fetch(
			`http://127.0.0.1:${debuggingPort}/json/new?about:blank`,
			{ method: 'PUT' }
		);
		page = await created.json();
	}
	assert.ok(page?.webSocketDebuggerUrl, 'Dedicated Chrome page was not available.');
	const client = await new CdpClient(page.webSocketDebuggerUrl).connect();
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	return client;
}

async function waitForReady(client) {
	for (let attempt = 0; attempt < 180; attempt += 1) {
		const ready = await Promise.race([
			client.evaluate(`(() => {
				const app = window.__AWTSMOOS_PARK_APP__;
				const canvas = document.querySelector('#character-canvas');
				return Boolean(canvas?.width && Object.keys(
					app?.state?.get?.('characters') || {}
				).length === 3);
			})()`),
			delay(500).then(() => false)
		]);
		if (ready) return;
		await delay(100);
	}
	throw new Error('Attached production Animator did not become ready.');
}

async function run() {
	const baseUrl = await server.start();
	const client = await connect();
	const chrome = { client };
	try {
		await client.send('Emulation.setDeviceMetricsOverride', {
			width: ReferenceProofStage.width,
			height: ReferenceProofStage.height,
			deviceScaleFactor: 1,
			mobile: false
		});
		const url = `${baseUrl}/geelooy/apps/animator/index.html?referenceTrioProof=1`;
		await Promise.race([client.send('Page.navigate', { url }), delay(2000)]);
		await waitForReady(client);
		await ReferenceProofStage.prepare(chrome);
		const plan = ReferenceStaticCropPlan.all();
		const characterIds = ReferenceStaticCropPlan.characterIds();
		const individualBoxes = await ReferenceCharacterIsolation.capture(
			chrome,
			characterIds
		);
		await ReferenceCharacterIsolation.setVisibility(chrome, null);
		await delay(400);
		const capture = await ReferenceStaticCanvasCapture.capture(chrome, plan);
		const report = {
			capturedAt: new Date().toISOString(),
			canvas: { width: ReferenceProofStage.width, height: ReferenceProofStage.height },
			characterIds,
			cropPlan: plan,
			individualBoxes
		};
		const written = await artifacts.persist(capture, report);
		assert.equal(written.crops.length, 6);
		assert.ok(written.crops.every(crop => crop.bytes > 1000));
		console.log(JSON.stringify({
			ok: true,
			canvas: report.canvas,
			characterIds,
			trioHash: written.trio.sha256,
			cropCount: written.crops.length
		}, null, 2));
	} finally {
		client.close();
		await server.stop();
	}
}

run().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
