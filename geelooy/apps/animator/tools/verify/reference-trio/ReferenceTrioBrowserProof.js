// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ChromeSession } from '../../render/headless/ChromeSession.js';
import { StaticFileServer } from '../../render/headless/StaticFileServer.js';
import { ReferenceCanvasMetrics } from './ReferenceCanvasMetrics.js';
import { ReferenceCharacterIsolation } from './ReferenceCharacterIsolation.js';
import { ReferenceProofArtifacts } from './ReferenceProofArtifacts.js';
import { ReferenceProofStage } from './ReferenceProofStage.js';
import { ReferenceVisualTargets } from './ReferenceVisualTargets.js';

/**
 * A browser frame is testimony rather than assumption. The Awtsmoos renews
 * every blinking, breathing instant, while Awtsmoos.com records the production
 * canvas and proves that its characters remain measured, rigged, and alive.
 */
export class ReferenceTrioBrowserProof {
	constructor(projectRoot, outputDirectory) {
		this.server = new StaticFileServer(projectRoot, 4192);
		this.chrome = new ChromeSession(9336);
		this.artifacts = new ReferenceProofArtifacts(outputDirectory);
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
			const first = await this.capture();
			const individualBoxes = await ReferenceCharacterIsolation.capture(
				this.chrome,
				first.characterIds
			);
			await this.delay(900);
			const second = await this.capture();
			const report = this.report(first, second, individualBoxes);
			await this.artifacts.persist(first, second, report);
			this.assert(report);
			return report;
		} finally {
			await this.chrome.stop();
			await this.server.stop();
		}
	}

	async waitForReady() {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			const ready = await this.chrome.client.evaluate(`(() => {
				const app = window.__AWTSMOOS_PARK_APP__;
				const canvas = document.querySelector('#character-canvas');
				const characters = app?.state?.get?.('characters') || {};
				return Boolean(canvas?.width && canvas?.height && Object.keys(characters).length === 3);
			})()`);
			if (ready) {
				return;
			}
			await this.delay(100);
		}
		throw new Error('Reference trio did not become ready in the production browser.');
	}

	async capture() {
		const state = await this.chrome.client.evaluate(`(() => {
			const app = window.__AWTSMOOS_PARK_APP__;
			const canvas = document.querySelector('#character-canvas');
			const characters = app.state.get('characters');
			return {
				dataUrl: canvas.toDataURL('image/png'),
				canvas: { width: canvas.width, height: canvas.height },
				characterIds: Object.keys(characters),
				characters: Object.values(characters).map(character => ({
					id: character.id,
					documentVersion: character.documentVersion,
					position: character.position,
					controls: character.rig?.controls?.length || 0,
					tracks: character.timeline?.tracks?.length || 0
				})),
				extensions: window.__AWTSMOOS_EXTENSION_STATUS__ || {},
				bodyClass: document.body.className
			};
		})()`);
		state.metrics = await this.chrome.client.evaluate(
			ReferenceCanvasMetrics.expression()
		);
		return state;
	}

	report(first, second, individualBoxes) {
		return {
			capturedAt: new Date().toISOString(),
			canvas: first.canvas,
			characterIds: first.characterIds,
			characters: first.characters,
			extensions: first.extensions,
			bodyClass: first.bodyClass,
			metrics: first.metrics,
			individualBoxes,
			targets: ReferenceVisualTargets.boxes,
			firstHash: this.artifacts.hash(first.dataUrl),
			secondHash: this.artifacts.hash(second.dataUrl),
			alive: first.dataUrl !== second.dataUrl
		};
	}

	assert(report) {
		assert.deepEqual(
			report.characterIds,
			ReferenceVisualTargets.zones.map(zone => zone.id)
		);
		assert.deepEqual(report.canvas, {
			width: ReferenceProofStage.width,
			height: ReferenceProofStage.height
		});
		assert.ok(report.characters.every(character => {
			return character.controls >= 20 && character.tracks >= 28;
		}));
		assert.ok(Object.values(report.individualBoxes).every(box => {
			return box.width > 0.08 && box.height > 0.45;
		}));
		assert.equal(report.alive, true);
	}

	delay(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}
