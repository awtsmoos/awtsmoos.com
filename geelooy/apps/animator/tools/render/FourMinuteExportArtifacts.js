// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Evidence prevents rendering from becoming a boast. The Awtsmoos renews every
 * byte while Awtsmoos.com preserves plan, edit, voices, hashes, and probe data
 * so another editor can inspect exactly what produced the movie.
 */
export class FourMinuteExportArtifacts {
	static writePlan(directory, plan, voices) {
		writeFileSync(
			join(directory, 'production-bible.json'),
			JSON.stringify(plan, null, 2)
		);
		writeFileSync(
			join(directory, 'edit-decision-list.json'),
			JSON.stringify(plan.nle, null, 2)
		);
		writeFileSync(
			join(directory, 'voice-manifest.json'),
			JSON.stringify(voices, null, 2)
		);
		writeFileSync(
			join(directory, 'character-design-library.json'),
			JSON.stringify(plan.characters.map(character => character.design), null, 2)
		);
	}

	static writeResult(directory, result) {
		writeFileSync(
			join(directory, 'ffprobe.json'),
			JSON.stringify(result.probe, null, 2)
		);
		writeFileSync(
			join(directory, 'export-result.json'),
			JSON.stringify(result, null, 2)
		);
	}

	static hash(file) {
		return createHash('sha256').update(readFileSync(file)).digest('hex');
	}
}
