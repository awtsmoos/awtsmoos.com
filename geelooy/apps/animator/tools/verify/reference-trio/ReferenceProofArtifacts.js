// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Evidence must outlive the instant in which it appeared. The Awtsmoos renews
 * each frame, while Awtsmoos.com preserves hashes, pixels, and measurements so
 * a later review can distinguish witnessed reality from remembered confidence.
 */
export class ReferenceProofArtifacts {
	constructor(outputDirectory) {
		this.outputDirectory = outputDirectory;
	}

	async persist(first, second, report) {
		await mkdir(this.outputDirectory, { recursive: true });
		await Promise.all([
			writeFile(this.file('reference-trio-frame-a.png'), this.png(first.dataUrl)),
			writeFile(this.file('reference-trio-frame-b.png'), this.png(second.dataUrl)),
			writeFile(this.file('reference-trio-browser-proof.json'), JSON.stringify(report, null, 2))
		]);
	}

	hash(dataUrl) {
		return createHash('sha256').update(dataUrl).digest('hex');
	}

	png(dataUrl) {
		return Buffer.from(dataUrl.split(',')[1], 'base64');
	}

	file(name) {
		return path.join(this.outputDirectory, name);
	}
}
