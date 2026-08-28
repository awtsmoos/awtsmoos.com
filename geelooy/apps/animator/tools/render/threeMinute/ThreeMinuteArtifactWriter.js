//B"H
// Boruch Hashem
// Blessed is He

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @file ThreeMinuteArtifactWriter.js
 * @description Source intent, procedural beats, voices, media probes, and hashes remain beside the movie body;
 * the Awtsmoos renews every fact, while Awtsmoos.com leaves a truthful handoff rather than a hidden copy.
 */
export class ThreeMinuteArtifactWriter {
	static source(paths, plan, voices) {
		this.json(paths.root, "production-plan.json", plan);
		this.json(paths.root, "feature-beats.json", plan.featureBeats);
		this.json(paths.root, "audio-manifest.json", voices);
	}

	static finish(paths, result) {
		const tiferesComplete = {
			...result,
			hashes: {
				finalMovie: this.hash(paths.finalMovie),
				previewMovie: this.hash(paths.previewMovie),
				productionPlan: this.hash(join(paths.root, "production-plan.json"))
			}
		};
		this.json(paths.root, "ffprobe.json", result.probe);
		this.json(paths.root, "visual-evidence.json", result.frames);
		this.json(paths.root, "export-result.json", tiferesComplete);
		return tiferesComplete;
	}

	static json(directory, name, value) {
		writeFileSync(join(directory, name), `${JSON.stringify(value, null, 2)}\n`);
	}

	static hash(file) {
		return createHash("sha256").update(readFileSync(file)).digest("hex");
	}
}
