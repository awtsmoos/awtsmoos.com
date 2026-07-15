// B"H
// Boruch Hashem
// Blessed is He

import { mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ChromeSession } from './ChromeSession.js';
import { LongFormRenderArtifact } from './LongFormRenderArtifact.js';
import { LongFormRenderMonitor } from './LongFormRenderMonitor.js';
import { StaticFileServer } from './StaticFileServer.js';

/**
 * A private browser carries the full six-minute film from procedural reality to
 * a verified Movies artifact. The Awtsmoos renews each encoded instant while
 * Awtsmoos.com requests a free HTTP port and an isolated Chrome debugging port.
 */
export class SixMinuteWebCodecsRenderRunner {
	constructor(projectRoot) {
		this.projectRoot = path.resolve(projectRoot);
		this.stateDirectory = path.join(this.projectRoot, '.awtsmoos-render-state');
		this.statusPath = path.join(this.stateDirectory, 'six-minute-webcodecs-status.json');
		this.outputDirectory = path.join(
			os.homedir(),
			'Movies',
			'AwtsmoosAnimatorExports',
			'2026-07-14-six-minute-action'
		);
		this.filename = 'the-beacon-that-broke-the-city-webcodecs.webm';
		this.outputPath = path.join(this.outputDirectory, this.filename);
	}

	async run() {
		await this.prepare();
		this.server = new StaticFileServer(this.projectRoot, 0);
		this.chrome = new ChromeSession(54193);
		try {
			const baseUrl = await this.server.start();
			await this.writeStatus('server-ready', { baseUrl });
			await this.chrome.start();
			await this.chrome.setDownloadPath(this.outputDirectory);
			await this.writeStatus('browser-ready');
			await this.chrome.navigate(`${baseUrl}/tools/render/six-minute-webcodecs.html?autostart=1`);
			await this.confirmCapability();
			const result = await this.monitor().waitForCompletion();
			const metadata = await this.artifact().finalize(result);
			await this.writeStatus('complete', metadata);
			console.log('B"H - six-minute movie completed', metadata);
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

	async prepare() {
		await mkdir(this.outputDirectory, { recursive: true });
		await mkdir(this.stateDirectory, { recursive: true });
		await rm(this.outputPath, { force: true });
		await this.writeStatus('starting');
	}

	async confirmCapability() {
		const capability = await this.chrome.client.evaluate(`({
			videoEncoder: typeof VideoEncoder,
			videoFrame: typeof VideoFrame,
			offscreenCanvas: typeof OffscreenCanvas
		})`);
		await this.writeStatus('capability-confirmed', capability);
	}

	monitor() {
		return new LongFormRenderMonitor({
			client: this.chrome.client,
			globalName: '__AWTSMOOS_SIX_MINUTE_EXPORT__',
			durationSeconds: 360,
			writeStatus: (status, details) => this.writeStatus(status, details),
			delay: (milliseconds) => this.delay(milliseconds)
		});
	}

	artifact() {
		return new LongFormRenderArtifact({
			client: this.chrome.client,
			globalName: '__AWTSMOOS_SIX_MINUTE_EXPORT__',
			outputDirectory: this.outputDirectory,
			outputPath: this.outputPath,
			delay: (milliseconds) => this.delay(milliseconds)
		});
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
