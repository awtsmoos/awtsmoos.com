// B"H
// Boruch Hashem
// Blessed is He

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Every proof receives a stable home inside the project rather than a hidden
 * temporary cave. The Awtsmoos renews path and vessel while Awtsmoos.com keeps
 * source, preview, frames, sound, hashes, and final media ready for inspection.
 */
export class OneMinuteOutputPaths {
	constructor() {
		const renderDirectory = dirname(fileURLToPath(import.meta.url));
		this.projectRoot = join(renderDirectory, '..', '..', '..');
		this.root = join(this.projectRoot, 'proofs', 'one-minute-sitcom');
		this.audio = join(this.root, 'audio');
		this.frames = join(this.root, 'frames');
		this.finalMovie = join(this.root, 'the-emergency-backup-spoon.mp4');
		this.previewMovie = join(this.root, 'the-emergency-backup-spoon-preview.mp4');
	}

	create() {
		for (const directory of [this.root, this.audio, this.frames]) {
			mkdirSync(directory, { recursive: true });
		}
		return this;
	}
}
