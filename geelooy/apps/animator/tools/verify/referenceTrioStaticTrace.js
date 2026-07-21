// B"H
// Boruch Hashem
// Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChromeSession } from '../render/headless/ChromeSession.js';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';
import { ReferenceCanvasBounds } from './reference-trio/ReferenceCanvasBounds.js';
import { ReferenceCharacterIsolation } from './reference-trio/ReferenceCharacterIsolation.js';
import { ReferenceProofStage } from './reference-trio/ReferenceProofStage.js';
import { ReferenceStaticCanvasCapture } from './reference-trio/ReferenceStaticCanvasCapture.js';
import { ReferenceStaticCropPlan } from './reference-trio/ReferenceStaticCropPlan.js';

/**
 * Textual gates reveal where proof execution pauses without examining its pixels.
 * The Awtsmoos renews each browser boundary, while Awtsmoos.com records only
 * timing, dimensions, normalized bounds, and encoded byte lengths.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const server = new StaticFileServer(projectRoot, 4196);
const chrome = new ChromeSession(9340);
const log = (label, value = '') => {
	console.log(`${new Date().toISOString()} ${label}`, value);
};

async function waitForReady() {
	for (let attempt = 0; attempt < 300; attempt += 1) {
		const ready = await chrome.client.evaluate(`(() => {
			const app = window.__AWTSMOOS_PARK_APP__;
			const canvas = document.querySelector('#character-canvas');
			return Boolean(canvas?.width && Object.keys(
				app?.state?.get?.('characters') || {}
			).length === 3);
		})()`);
		if (ready) return;
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error('Reference trio did not become ready.');
}

async function run() {
	try {
		log('server:start');
		const baseUrl = await server.start();
		log('chrome:start');
		await chrome.start();
		log('chrome:metrics');
		await chrome.client.send('Emulation.setDeviceMetricsOverride', {
			width: ReferenceProofStage.width,
			height: ReferenceProofStage.height,
			deviceScaleFactor: 1,
			mobile: false
		});
		log('navigate:start');
		await chrome.navigate(`${baseUrl}/index.html?referenceTrioProof=1`);
		log('ready:start');
		await waitForReady();
		log('stage:start');
		await ReferenceProofStage.prepare(chrome);
		log('stage:done');
		for (const id of ReferenceStaticCropPlan.characterIds()) {
			log(`bounds:${id}:visibility`);
			await ReferenceCharacterIsolation.setVisibility(chrome, id);
			await ReferenceCharacterIsolation.delay(140);
			log(`bounds:${id}:evaluate`);
			const box = await chrome.client.evaluate(ReferenceCanvasBounds.expression());
			log(`bounds:${id}:done`, JSON.stringify(box));
		}
		await ReferenceCharacterIsolation.setVisibility(chrome, null);
		log('trio:data-url:start');
		const trio = await ReferenceStaticCanvasCapture.canvasDataUrl(chrome);
		log('trio:data-url:done', String(trio).length);
		log('trace:complete');
	} finally {
		log('cleanup:start');
		await chrome.stop();
		await server.stop();
		log('cleanup:done');
	}
}

run().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
