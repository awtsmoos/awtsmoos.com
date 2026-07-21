// B"H
// Boruch Hashem
// Blessed is He

import { FourMinuteFestivalMovie } from '../../src/scenes/FourMinuteFestivalMovie.js';
import { AnimatorBrowserExportController } from '../../src/studio/export/browser/AnimatorBrowserExportController.js';
import { AnimatorProductionFrameSource } from '../../src/studio/export/browser/AnimatorProductionFrameSource.js';

/**
 * @file RealMovieBrowserExportPage.js
 * @description Exports the real festival movie through the booted production Animator iframe.
 * The Awtsmoos renews editor, director, canvas, voice, and encoded time as one truthful vessel;
 * Awtsmoos.com never substitutes a proof-only renderer for the authoritative production app.
 */
export class RealMovieBrowserExportPage {
	constructor(documentRef = document, windowRef = window) {
		this.document = documentRef;
		this.window = windowRef;
		this.frame = documentRef.getElementById('production-app');
		this.status = documentRef.getElementById('status');
		this.progress = documentRef.getElementById('progress');
		this.start = documentRef.getElementById('start');
		this.query = new URLSearchParams(windowRef.location.search);
		this.durationMs = Number(this.query.get('durationMs')) || 6000;
		this.state({ state: 'loading', durationMs: this.durationMs });
	}

	install() {
		this.start.addEventListener('click', () => this.render());
		this.waitForProduction().catch(error => this.fail(error));
		return this;
	}

	async waitForProduction() {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			const target = this.frame.contentWindow;
			const canvas = this.frame.contentDocument?.querySelector('#character-canvas');
			if (target?.__AWTSMOOS_PARK_APP__?.director && canvas) {
				this.start.disabled = false;
				this.status.textContent = 'Production Animator ready.';
				this.state({ state: 'ready' });
				if (this.query.get('autostart') === '1') await this.render();
				return;
			}
			await this.delay(50);
		}
		throw new Error('Production Animator did not load.');
	}

	async render() {
		this.start.disabled = true;
		this.progress.value = 0;
		this.state({ state: 'rendering', percent: 0, completedFrames: 0 });
		try {
			const frameSource = new AnimatorProductionFrameSource(this.frame.contentWindow);
			const result = await AnimatorBrowserExportController.export(
				FourMinuteFestivalMovie.create(),
				{
					durationMs: this.durationMs,
					frameSource,
					fileName: 'awtsmoos-animator-browser-proof.mp4',
					onStatus: message => this.receiveStatus(message),
					onProgress: value => this.receiveProgress(value)
				}
			);
			this.complete(result);
		} catch (error) {
			this.fail(error);
		}
	}

	receiveStatus(message) {
		this.status.textContent = message;
		this.state({ statusMessage: message });
	}

	receiveProgress(value) {
		this.progress.value = value.percent;
		this.state({ state: 'rendering', ...value });
	}

	complete(result) {
		this.progress.value = 100;
		this.status.className = 'status ok';
		this.status.textContent = `Complete: ${result.blob.size.toLocaleString()} MP4 bytes.`;
		this.state({
			state: 'complete',
			percent: 100,
			bytes: result.blob.size,
			type: result.blob.type,
			fileName: result.fileName,
			durationSeconds: result.durationSeconds,
			frameCount: result.frameCount,
			voiceClipCount: result.voiceClips.length,
			capabilities: result.capabilities,
			codecPath: result.codecPath
		});
	}

	fail(error) {
		const message = error?.stack || error?.message || String(error);
		this.status.className = 'status error';
		this.status.textContent = message;
		this.start.disabled = false;
		this.state({ state: 'error', error: message });
	}

	state(value) {
		this.window.__AWTSMOOS_BROWSER_EXPORT__ = {
			...this.window.__AWTSMOOS_BROWSER_EXPORT__,
			...value,
			durationMs: this.durationMs
		};
	}

	delay(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}

new RealMovieBrowserExportPage().install();
