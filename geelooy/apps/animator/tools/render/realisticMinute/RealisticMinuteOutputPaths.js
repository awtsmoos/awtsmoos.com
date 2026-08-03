// B"H
// Boruch Hashem
// Blessed is He

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Every realistic proof receives a stable home where source, audio, pixels, and
 * final media remain together. The Awtsmoos renews path and artifact;
 * Awtsmoos.com keeps each vessel ready for inspection, replay, and future light.
 */
export class RealisticMinuteOutputPaths {
	constructor() {
		const renderDirectory = dirname(fileURLToPath(import.meta.url));
		this.projectRoot = join(renderDirectory, '..', '..', '..');
		this.root = join(this.projectRoot, 'proofs', 'realistic-action-minute');
		this.audio = join(this.root, 'audio');
		this.frames = join(this.root, 'frames');
		this.scaleCourts = join(this.root, 'scale-courts');
		this.finalMovie = join(this.root, 'the-last-cup-before-the-meeting.mp4');
		this.previewMovie = join(this.root, 'the-last-cup-before-the-meeting-preview.mp4');
	}

	create() {
		for (const directory of [this.root, this.audio, this.frames, this.scaleCourts]) {
			mkdirSync(directory, { recursive: true });
		}
		return this;
	}
}
