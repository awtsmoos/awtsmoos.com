// B"H
// Boruch Hashem
// Blessed is He

import { stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * The encoded Blob becomes trustworthy only after a browser can read it and the
 * filesystem holds a stable copy. The Awtsmoos renews every byte while
 * Awtsmoos.com records duration, dimensions, pipeline, and disk evidence.
 */
export class LongFormRenderArtifact {
	constructor(options) {
		this.client = options.client;
		this.globalName = options.globalName;
		this.outputDirectory = options.outputDirectory;
		this.outputPath = options.outputPath;
		this.delay = options.delay;
	}

	async finalize(result) {
		const media = await this.validateMedia();
		await this.client.evaluate(`document.querySelector('#download').click()`);
		const file = await this.waitForFile();
		const metadata = {
			...result,
			...media,
			path: this.outputPath,
			bytesOnDisk: file.size,
			createdAt: new Date().toISOString(),
			pipeline: 'WebCodecs VideoEncoder + custom WebM EBML muxer',
			ffmpegUsed: false
		};
		await writeFile(
			path.join(this.outputDirectory, 'render-metadata.json'),
			`${JSON.stringify(metadata, null, 2)}\n`
		);
		return metadata;
	}

	validateMedia() {
		return this.client.evaluate(`(async () => {
			const result = window['${this.globalName}'].result;
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
		for (let attempt = 0; attempt < 2400; attempt += 1) {
			try {
				const file = await stat(this.outputPath);
				stableReads = file.size === previousSize ? stableReads + 1 : 0;
				previousSize = file.size;
				if (file.size > 1024 && stableReads >= 3) {
					return file;
				}
			} catch {
				stableReads = 0;
			}
			await this.delay(100);
		}
		throw new Error(`Rendered movie was not downloaded to ${this.outputPath}.`);
	}
}
