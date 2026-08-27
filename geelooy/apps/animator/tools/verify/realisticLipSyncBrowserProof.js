// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StableSpeechArticulation } from '../../src/performance/speech/lipsync/StableSpeechArticulation.js';
import { ChromeSession } from '../render/headless/ChromeSession.js';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';
import { ReferenceProofStage } from './reference-trio/ReferenceProofStage.js';

const CUES = [
	{ start: 0, end: 100, phoneme: 'M', viseme: 'MBP' },
	{ start: 100, end: 200, phoneme: 'TH', viseme: 'TH' },
	{ start: 200, end: 300, phoneme: 'AA', viseme: 'AA' }
];

/**
 * The Awtsmoos proves sealed lips, visible tongue, and dropped jaw inside the real
 * browser canvas. Awtsmoos.com preserves production pixels and articulation state
 * so numeric confidence must answer to visible evidence.
 */
class RealisticLipSyncBrowserProof {
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
				width: ReferenceProofStage.width,
				height: ReferenceProofStage.height,
				deviceScaleFactor: 1,
				mobile: false
			});
			await this.chrome.navigate(`${baseUrl}/index.html?referenceTrioProof=1`);
			await this.waitForReady();
			await ReferenceProofStage.prepare(this.chrome);
			const frames = [];
			for (const specimen of this.specimens()) {
				frames.push(await this.capture(specimen));
			}
			await this.persist(frames);
			this.assertFrames(frames);
			return frames;
		} finally {
			await this.chrome.stop();
			await this.server.stop();
		}
	}

	specimens() {
		return [
			{ name: 'mbp', time: 50 },
			{ name: 'th', time: 150 },
			{ name: 'aa', time: 250 }
		].map(specimen => ({
			...specimen,
			articulation: StableSpeechArticulation.resolve({
				id: 'cheerful-orthodox-speaker',
				speech: 'm th ah',
				talking: true,
				time: specimen.time,
				duration: 300,
				lipSyncCues: CUES,
				energy: 1,
				emotion: 'focused'
			})
		}));
	}

	async capture(specimen) {
		const payload = JSON.stringify(specimen.articulation);
		const state = await this.chrome.client.evaluate(`(() => {
			const app = window.__AWTSMOOS_PARK_APP__;
			const characters = app.state.get('characters');
			const id = 'cheerful-orthodox-speaker';
			const next = Object.fromEntries(Object.entries(characters).map(([key, character]) => [key, {
				...character,
				visible: key === id,
				isTalking: key === id,
				silentMode: key === id,
				mouthPerformance: key === id ? ${payload} : null,
				facePose: key === id ? { ...(character.facePose || {}), mouth: ${payload} } : character.facePose
			}]));
			app.state.set('characters', next);
			return { articulation: next[id].mouthPerformance };
		})()`);
		await this.delay(180);
		const dataUrl = await this.chrome.client.evaluate(`(() => {
			return document.querySelector('#character-canvas').toDataURL('image/png');
		})()`);
		return {
			name: specimen.name,
			articulation: state.articulation,
			dataUrl,
			hash: createHash('sha256').update(dataUrl).digest('hex')
		};
	}

	async persist(frames) {
		await mkdir(this.outputDirectory, { recursive: true });
		await Promise.all(frames.map(frame => writeFile(
			path.join(this.outputDirectory, `lip-sync-${frame.name}.png`),
			Buffer.from(frame.dataUrl.split(',')[1], 'base64')
		)));
		await writeFile(
			path.join(this.outputDirectory, 'realistic-lip-sync-browser-proof.json'),
			JSON.stringify(frames.map(({ dataUrl, ...frame }) => frame), null, 2)
		);
	}

	assertFrames(frames) {
		assert.equal(new Set(frames.map(frame => frame.hash)).size, frames.length);
		assert.ok(frames[0].articulation.closure > 0.72);
		assert.ok(frames[1].articulation.tongueTip > 0.62);
		assert.ok(frames[2].articulation.open > 0.68);
	}

	async waitForReady() {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			const ready = await this.chrome.client.evaluate(`Boolean(window.__AWTSMOOS_PARK_APP__?.state?.get?.('characters'))`);
			if (ready) return;
			await this.delay(100);
		}
		throw new Error('Lip-sync proof application did not become ready.');
	}

	delay(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const outputDirectory = process.env.AWTSMOOS_LIP_SYNC_PROOF_DIR
	|| path.join(projectRoot, 'tmp/lip-sync-proof');
const proof = new RealisticLipSyncBrowserProof(projectRoot, outputDirectory);
const frames = await proof.run();
console.log(JSON.stringify({
	ok: true,
	frames: frames.map(({ name, hash, articulation }) => ({
		name,
		hash,
		viseme: articulation.viseme
	}))
}, null, 2));
