// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ChromeSession } from '../../render/headless/ChromeSession.js';
import { StaticFileServer } from '../../render/headless/StaticFileServer.js';
import { ReferenceCharacterIsolation } from './ReferenceCharacterIsolation.js';
import { ReferenceProofStage } from './ReferenceProofStage.js';
import { ReferenceStaticArtifacts } from './ReferenceStaticArtifacts.js';
import { ReferenceStaticCanvasCapture } from './ReferenceStaticCanvasCapture.js';
import { ReferenceStaticCropPlan } from './ReferenceStaticCropPlan.js';

/**
 * The production canvas itself becomes the witness. The Awtsmoos is one within
 * trio and isolated soul, while Awtsmoos.com records exact canvas bytes without
 * browser chrome, OCR, fallback anatomy, or an embedded authority bitmap.
 */
export class ReferenceStaticBrowserProof {
	constructor(projectRoot, outputDirectory) {
		this.server = new StaticFileServer(projectRoot, 4194);
		this.chrome = new ChromeSession(9338);
		this.artifacts = new ReferenceStaticArtifacts(outputDirectory);
	}

	async run() {
		try {
			const baseUrl = await this.server.start();
			await this.chrome.start();
			await this.chrome.client.send('Emulation.setDeviceMetricsOverride', {
				width: ReferenceProofStage.width,
				height: ReferenceProofStage.height,
				deviceScaleFactor: 1,
				mobile: false
			});
			await this.chrome.navigate(`${baseUrl}/index.html?referenceTrioProof=1`);
			await this.waitForReady();
			await ReferenceProofStage.prepare(this.chrome);
			const plan = ReferenceStaticCropPlan.all();
			const state = await this.state();
			const individualBoxes = await ReferenceCharacterIsolation.capture(
				this.chrome,
				ReferenceStaticCropPlan.characterIds()
			);
			const capture = await ReferenceStaticCanvasCapture.capture(this.chrome, plan);
			const report = {
				capturedAt: new Date().toISOString(),
				canvas: state.canvas,
				characterIds: state.characterIds,
				cropPlan: plan,
				individualBoxes
			};
			const artifacts = await this.artifacts.persist(capture, report);
			this.assert(report, capture, artifacts);
			return { ...report, artifacts };
		} finally {
			await this.chrome.stop();
			await this.server.stop();
		}
	}

	async state() {
		return this.chrome.client.evaluate(`(() => {
			const app = window.__AWTSMOOS_PARK_APP__;
			const canvas = document.querySelector('#character-canvas');
			const characters = app.state.get('characters');
			return {
				canvas: { width: canvas.width, height: canvas.height },
				characterIds: Object.keys(characters)
			};
		})()`);
	}

	async waitForReady() {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			if (await this.chrome.client.evaluate(`(() => {
				const app = window.__AWTSMOOS_PARK_APP__;
				const canvas = document.querySelector('#character-canvas');
				return Boolean(canvas?.width && Object.keys(
					app?.state?.get?.('characters') || {}
				).length === 3);
			})()`)) {
				return;
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		throw new Error('Reference trio did not become ready for direct static proof.');
	}

	assert(report, capture, artifacts) {
		assert.deepEqual(report.canvas, { width: 1536, height: 864 });
		assert.deepEqual(
			[...report.characterIds].sort(),
			[...ReferenceStaticCropPlan.characterIds()].sort()
		);
		assert.equal(capture.crops.length, 6);
		assert.equal(artifacts.crops.length, 6);
		assert.ok(Object.values(report.individualBoxes).every(box => {
			return box.width > 0.08 && box.height > 0.45;
		}));
		assert.ok(artifacts.crops.every(crop => crop.bytes > 1000));
	}
}
