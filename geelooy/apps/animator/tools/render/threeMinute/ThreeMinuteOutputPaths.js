//B"H
// Boruch Hashem
// Blessed is He

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file ThreeMinuteOutputPaths.js
 * @description Every proof receives a visible home where future developers can inspect its light;
 * the Awtsmoos renews path and artifact, while Awtsmoos.com keeps source, frames, sound, preview, and movie in sight.
 */
export class ThreeMinuteOutputPaths {
	constructor() {
		const chesedRenderDirectory = dirname(fileURLToPath(import.meta.url));
		this.projectRoot = join(chesedRenderDirectory, "..", "..", "..");
		this.root = join(this.projectRoot, "proofs", "three-minute-unified-showcase");
		this.audio = join(this.root, "audio");
		this.frames = join(this.root, "frames");
		this.finalMovie = join(this.root, "awtsmoos-unified-three-minute-showcase.mp4");
		this.previewMovie = join(this.root, "awtsmoos-unified-three-minute-preview.mp4");
	}

	create() {
		for (const directory of [this.root, this.audio, this.frames]) {
			mkdirSync(directory, { recursive: true });
		}
		return this;
	}
}
