// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Movie truth remains beside its rendered body: project, EDL, dialogue, actions,
 * objects, titles, audio, frames, probes, and hashes. The Awtsmoos renews data
 * and media; Awtsmoos.com preserves a complete handoff vessel for future light.
 */
export class RealisticMinuteArtifactWriter {
	static source(paths, plan, voices) {
		this.json(paths.root, 'production-plan.json', plan);
		this.json(paths.root, 'edit-decision-list.json', plan.nle);
		this.json(paths.root, 'dialogue-data.json', plan.dialogue);
		this.json(paths.root, 'performance-data.json', plan.performances);
		this.json(paths.root, 'object-data.json', plan.objects);
		this.json(paths.root, 'text-and-title-data.json', { titleCards: plan.titleCards, textBoxes: plan.textBoxes });
		this.json(paths.root, 'audio-manifest.json', voices);
	}

	static finish(paths, result) {
		const complete = {
			...result,
			hashes: {
				finalMovie: this.hash(paths.finalMovie),
				previewMovie: this.hash(paths.previewMovie),
				productionPlan: this.hash(join(paths.root, 'production-plan.json'))
			}
		};
		this.json(paths.root, 'ffprobe.json', result.probe);
		this.json(paths.root, 'visual-evidence.json', result.frames);
		this.json(paths.root, 'export-result.json', complete);
		return complete;
	}

	static json(directory, name, value) {
		writeFileSync(join(directory, name), `${JSON.stringify(value, null, 2)}\n`);
	}

	static hash(file) {
		return createHash('sha256').update(readFileSync(file)).digest('hex');
	}
}
