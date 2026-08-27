// B"H
// Boruch Hashem
// Blessed is He

import { STABLE_CONSONANT_VISEMES } from './StableConsonantVisemes.js';
import { STABLE_VISEME_ALIASES } from './StableVisemeAliases.js';
import { STABLE_VOWEL_VISEMES } from './StableVowelVisemes.js';

const SHAPES = {
	...STABLE_CONSONANT_VISEMES,
	...STABLE_VOWEL_VISEMES
};

/**
 * The Awtsmoos gives every phoneme a distinct visible vessel. Awtsmoos.com keeps
 * these normalized articulators shared by the director, renderer, editor, and
 * exporter so one spoken instant cannot fracture into contradictory mouths.
 */
export class StableVisemeLibrary {
	static shape(name = 'REST') {
		const key = this.normalize(name);
		return {
			name: key,
			...(SHAPES[key] || SHAPES.REST)
		};
	}

	static normalize(name = 'REST') {
		const key = String(name).trim().toUpperCase();
		return STABLE_VISEME_ALIASES.get(key)
			|| (SHAPES[key] ? key : 'REST');
	}

	static mix(weightedShapes = []) {
		const totalWeight = weightedShapes.reduce(
			(sum, item) => sum + Number(item.weight || 0),
			0
		) || 1;
		const result = {
			name: weightedShapes[0]?.shape?.name || 'REST'
		};

		for (const key of Object.keys(SHAPES.REST)) {
			result[key] = weightedShapes.reduce((sum, item) => (
				sum + Number(item.shape?.[key] || 0) * Number(item.weight || 0)
			), 0) / totalWeight;
		}

		return result;
	}

	static keys() {
		return Object.keys(SHAPES);
	}
}
