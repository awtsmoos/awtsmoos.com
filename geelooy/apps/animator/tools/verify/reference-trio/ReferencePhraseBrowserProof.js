// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ChromeSession } from '../../render/headless/ChromeSession.js';
import { StaticFileServer } from '../../render/headless/StaticFileServer.js';
import { ReferencePhraseTrace } from './ReferencePhraseTrace.js';
import { ReferenceProofStage } from './ReferenceProofStage.js';

const REQUIRED = ['MBP', 'FV', 'TH', 'TD', 'L', 'KG', 'S', 'CH', 'R', 'AA', 'E', 'I', 'O', 'U'];

/**
 * The real canvas performs a phrase at normal and slow speed. The Awtsmoos is
 * one beyond frames; Awtsmoos.com records identical pixels for identical seeks.
 */
export class ReferencePhraseBrowserProof {
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
			const trace = ReferencePhraseTrace.create();
			const frames = [];
			for (const sample of [...trace.normal, ...trace.slow]) {
				frames.push(await this.capture(sample));
			}
			const repeats = [];
			for (const index of [2, 6, 10]) {
				repeats.push(await this.capture(trace.normal[index], `repeat-${index}`));
			}
			await this.persist(trace, frames, repeats);
			this.assertProof(trace, frames, repeats);
			return { trace, frames, repeats };
		} finally {
			await this.chrome.stop();
			await this.server.stop();
		}
	}

	async capture(sample, label = null) {
		const payload = JSON.stringify(sample.articulation);
		await this.chrome.client.evaluate(`(() => {
			const app = window.__AWTSMOOS_PARK_APP__;
			const id = 'cheerful-orthodox-speaker';
			app.state.set('userPausedPlayback', true, true);
			app.director.stop();
			app.director.seek(${sample.time});
			const characters = app.state.get('characters');
			app.state.set('characters', Object.fromEntries(Object.entries(characters).map(([key, value]) => [key, {
				...value, visible: key === id, isTalking: key === id, silentMode: key === id,
				mouthPerformance: key === id ? ${payload} : null,
				facePose: key === id ? { ...(value.facePose || {}), mouth: ${payload} } : value.facePose
			}])));
		})()`);
		await new Promise(resolve => setTimeout(resolve, 70));
		const dataUrl = await this.chrome.client.evaluate(`document.querySelector('#character-canvas').toDataURL('image/png')`);
		return { ...sample, label, dataUrl, hash: createHash('sha256').update(dataUrl).digest('hex') };
	}

	async persist(trace, frames, repeats) {
		await mkdir(this.outputDirectory, { recursive: true });
		for (const frame of frames) {
			const file = `${frame.speed}-${String(frame.index).padStart(3, '0')}.png`;
			await writeFile(path.join(this.outputDirectory, file), Buffer.from(frame.dataUrl.split(',')[1], 'base64'));
		}
		const clean = frame => {
			const { dataUrl, ...record } = frame;
			return record;
		};
		await writeFile(path.join(this.outputDirectory, 'phrase-proof.json'), JSON.stringify({
			phrase: trace.phrase, duration: trace.duration, cues: trace.cues,
			frames: frames.map(clean), repeats: repeats.map(clean)
		}, null, 2));
	}

	async waitForReady() {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			if (await this.chrome.client.evaluate(`Boolean(window.__AWTSMOOS_PARK_APP__?.state?.get?.('characters'))`)) return;
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		throw new Error('Phrase proof application did not become ready.');
	}

	assertProof(trace, frames, repeats) {
		assert.ok(REQUIRED.every(viseme => trace.cues.some(cue => cue.viseme === viseme)));
		for (const repeat of repeats) {
			const original = frames.find(frame => frame.speed === 'normal' && frame.index === repeat.index);
			assert.equal(repeat.hash, original.hash, `Timestamp ${repeat.time} changed pixels.`);
		}
	}
}
