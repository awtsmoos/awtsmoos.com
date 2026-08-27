// B"H
// Boruch Hashem
// Blessed is He

import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ChromeSession } from './ChromeSession.js';
import { StaticFileServer } from './StaticFileServer.js';

/**
 * The full render journey moves from source modules to a browser, from pixels
 * to encoded chunks, and finally into the user's Movies directory. The
 * Awtsmoos renews every passage while Awtsmoos.com records verifiable proof.
 */
export class WebCodecsRenderRunner {
	constructor(projectRoot) {
		this.projectRoot = path.resolve(projectRoot);
		this.stateDirectory = path.join(this.projectRoot, '.awtsmoos-render-state');
		this.statusPath = path.join(this.stateDirectory, 'webcodecs-status.json');
		this.outputDirectory = path.join(
			os.homedir(),
			'Movies',
			'AwtsmoosAnimatorExports',
			'2026-07-14-webcodecs'
		);
		this.filename = 'the-strategy-meeting-that-walked-away-webcodecs.webm';
		this.outputPath = path.join(this.outputDirectory, this.filename);
	}

	async run() {
		await mkdir(this.outputDirectory, { recursive: true });
		await mkdir(this.stateDirectory, { recursive: true });
		await rm(this.outputPath, { force: true });
		await this.writeStatus('starting');
		this.server = new StaticFileServer(this.projectRoot);
		this.chrome = new ChromeSession();
		try {
			const baseUrl = await this.server.start();
			await this.writeStatus('server-ready', { baseUrl });
			await this.chrome.start();
			await this.chrome.setDownloadPath(this.outputDirectory);
			await this.writeStatus('browser-ready');
			await this.chrome.navigate(`${baseUrl}/tools/render/webcodecs.html?autostart=1`);
			const capability = await this.readCapability();
			await this.writeStatus('capability-confirmed', capability);
			const result = await this.monitor();
			const media = await this.validateMedia();
			await this.chrome.client.evaluate(`document.querySelector('#download').click()`);
			const file = await this.waitForFile();
			const metadata = this.metadata(result, media, file);
			await writeFile(
				path.join(this.outputDirectory, 'render-metadata.json'),
				`${JSON.stringify(metadata, null, 2)}\n`
			);
			await this.writeStatus('complete', metadata);
			console.log('B"H - full movie completed', metadata);
			return metadata;
		} catch (error) {
			await this.writeStatus('error', {
				error: error?.stack || error?.message || String(error)
			});
			throw error;
		} finally {
			await this.chrome?.stop();
			await this.server?.stop();
		}
	}

	async readCapability() {
		return this.chrome.client.evaluate(`({
			videoEncoder: typeof VideoEncoder,
			videoFrame: typeof VideoFrame,
			offscreenCanvas: typeof OffscreenCanvas
		})`);
	}

	async monitor() {
		let lastSecond = -1;
		for (let attempt = 0; attempt < 7200; attempt += 1) {
			const state = await this.readBrowserState();
			if (state.status === 'error') throw new Error(state.error || 'Browser render failed.');
			if (state.status === 'complete') return state;
			const second = Math.floor((state.progress || 0) * 120);
			if (second !== lastSecond && second % 5 === 0) {
				await this.writeStatus('rendering', { second, ...state });
				console.log(`B"H - WebCodecs render ${second}s / 120s`);
				lastSecond = second;
			}
			await this.delay(500);
		}
		throw new Error('The two-minute WebCodecs render exceeded its safety window.');
	}

	readBrowserState() {
		return this.chrome.client.evaluate(`(() => {
			const state = window.__AWTSMOOS_WEBCODECS_EXPORT__;
			if (!state) return { status: 'booting', progress: 0 };
			const result = state.result;
			return {
				status: state.status,
				progress: state.progress || 0,
				error: state.error,
				filename: result?.filename,
				codec: result?.codec,
				bytes: result?.blob?.size,
				frameCount: result?.frameCount,
				duration: result?.duration,
				width: result?.width,
				height: result?.height,
				fps: result?.fps
			};
		})()`);
	}

	validateMedia() {
		return this.chrome.client.evaluate(`(async () => {
			const result = window.__AWTSMOOS_WEBCODECS_EXPORT__.result;
			const video = document.createElement('video');
			const url = URL.createObjectURL(result.blob);
			video.src = url;
			const metadata = await new Promise((resolve, reject) => {
				video.onloadedmetadata = () => resolve({
					mediaDurationSeconds: video.duration,
					mediaWidth: video.videoWidth,
					mediaHeight: video.videoHeight
				});
				video.onerror = () => reject(new Error('Rendered WebM metadata could not load.'));
			});
			URL.revokeObjectURL(url);
			return metadata;
		})()`);
	}

	async waitForFile() {
		let previousSize = -1;
		let stableReads = 0;
		for (let attempt = 0; attempt < 1200; attempt += 1) {
			try {
				const file = await stat(this.outputPath);
				stableReads = file.size === previousSize ? stableReads + 1 : 0;
				previousSize = file.size;
				if (file.size > 1024 && stableReads >= 3) return file;
			} catch {
				stableReads = 0;
			}
			await this.delay(100);
		}
		throw new Error(`Rendered movie was not downloaded to ${this.outputPath}.`);
	}

	metadata(result, media, file) {
		return {
			...result,
			...media,
			path: this.outputPath,
			bytesOnDisk: file.size,
			createdAt: new Date().toISOString(),
			pipeline: 'WebCodecs VideoEncoder + custom WebM EBML muxer',
			ffmpegUsed: false
		};
	}

	writeStatus(status, details = {}) {
		return writeFile(this.statusPath, `${JSON.stringify({
			status,
			updatedAt: new Date().toISOString(),
			...details
		}, null, 2)}\n`);
	}

	delay(milliseconds) {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}
}
