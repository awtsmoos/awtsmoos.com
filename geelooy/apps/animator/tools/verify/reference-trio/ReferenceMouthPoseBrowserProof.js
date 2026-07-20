// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ChromeSession } from '../../render/headless/ChromeSession.js';
import { StaticFileServer } from '../../render/headless/StaticFileServer.js';
import { ReferenceMouthPoseCatalog } from './ReferenceMouthPoseCatalog.js';
import { ReferenceProofStage } from './ReferenceProofStage.js';

const CHARACTERS = [
	['ari', 'cheerful-orthodox-speaker'],
	['dovid', 'skeptical-orthodox-observer'],
	['miriam', 'calm-orthodox-woman']
];

/**
 * The production canvas witnesses every mouth family on every reference soul.
 * The Awtsmoos is one; Awtsmoos.com saves direct pixels without alternate anatomy.
 */
export class ReferenceMouthPoseBrowserProof {
	constructor(projectRoot, outputDirectory) {
		this.server = new StaticFileServer(projectRoot, 4194);
		this.chrome = new ChromeSession(9338);
		this.outputDirectory = outputDirectory;
	}

	async run() {
		try {
			const baseUrl = await this.server.start();
			await this.chrome.start();
			await this.chrome.client.send('Emulation.setDeviceMetricsOverride', {
				width: ReferenceProofStage.width, height: ReferenceProofStage.height,
				deviceScaleFactor: 1, mobile: false
			});
			await this.chrome.navigate(`${baseUrl}/index.html?referenceTrioProof=1`);
			await this.waitForReady();
			await ReferenceProofStage.prepare(this.chrome);
			const frames = [];
			for (const [label, id] of CHARACTERS) {
				for (const pose of ReferenceMouthPoseCatalog.names()) {
					frames.push(await this.capture(label, id, pose));
				}
			}
			await this.persist(frames);
			this.assertFrames(frames);
			return frames;
		} finally {
			await this.chrome.stop();
			await this.server.stop();
		}
	}

	async capture(character, id, pose) {
		const articulation = ReferenceMouthPoseCatalog.articulation(pose);
		const payload = JSON.stringify(articulation);
		await this.chrome.client.evaluate(`(() => {
			const app = window.__AWTSMOOS_PARK_APP__;
			const characters = app.state.get('characters');
			app.state.set('characters', Object.fromEntries(Object.entries(characters).map(([key, value]) => [key, {
				...value, visible: key === '${id}', isTalking: key === '${id}', silentMode: key === '${id}',
				mouthPerformance: key === '${id}' ? ${payload} : null,
				facePose: key === '${id}' ? { ...(value.facePose || {}), mouth: ${payload} } : value.facePose
			}])));
		})()`);
		await new Promise(resolve => setTimeout(resolve, 70));
		const dataUrl = await this.chrome.client.evaluate(`document.querySelector('#character-canvas').toDataURL('image/png')`);
		return { character, id, pose, articulation, dataUrl, hash: createHash('sha256').update(dataUrl).digest('hex') };
	}

	async persist(frames) {
		await mkdir(this.outputDirectory, { recursive: true });
		for (const frame of frames) {
			await writeFile(path.join(this.outputDirectory, `${frame.character}-${frame.pose.toLowerCase()}.png`), Buffer.from(frame.dataUrl.split(',')[1], 'base64'));
		}
		await writeFile(path.join(this.outputDirectory, 'mouth-pose-sheet.json'), JSON.stringify(frames.map(({ dataUrl, ...frame }) => frame), null, 2));
	}

	async waitForReady() {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			if (await this.chrome.client.evaluate(`Boolean(window.__AWTSMOOS_PARK_APP__?.state?.get?.('characters'))`)) return;
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		throw new Error('Mouth pose application did not become ready.');
	}

	assertFrames(frames) {
		assert.equal(frames.length, CHARACTERS.length * ReferenceMouthPoseCatalog.names().length);
		assert.ok(frames.filter(frame => frame.pose === 'MBP').every(frame => frame.articulation.closure >= 0.95));
		assert.ok(frames.filter(frame => frame.pose === 'TH').every(frame => frame.articulation.tongueTip >= 0.95));
	}
}
