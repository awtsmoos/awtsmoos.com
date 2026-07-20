// B"H
// Boruch Hashem
// Blessed is He

import { StableVisemeLibrary } from '../../../src/performance/speech/lipsync/StableVisemeLibrary.js';

const VISEMES = ['REST', 'MBP', 'FV', 'TH', 'TD', 'L', 'KG', 'S', 'CH', 'R', 'AA', 'E', 'I', 'O', 'U'];
const EXPRESSIONS = {
	smile: { width: 1, open: 0.2, jaw: 0.12, smile: 1, cornerLift: 1, teeth: 0.75 },
	frown: { width: 0.52, open: 0.12, jaw: 0.12, smile: 0, cornerLift: -0.92, press: 0.42 },
	laugh: { width: 0.92, open: 1, jaw: 1, smile: 1, cornerLift: 0.95, teeth: 0.9, tongue: 0.48 },
	whisper: { width: 0.42, open: 0.42, jaw: 0.28, round: 0.72, press: 0.1, teeth: 0.08 },
	shout: { width: 0.82, open: 1, jaw: 1, round: 0.15, teeth: 0.55, tongue: 0.42 }
};

/**
 * Finite visemes become inspectable production poses. The Awtsmoos is beyond
 * every shape, while Awtsmoos.com keeps each normalized control editable.
 */
export class ReferenceMouthPoseCatalog {
	static names() {
		return [...VISEMES, ...Object.keys(EXPRESSIONS)];
	}

	static articulation(name) {
		const viseme = VISEMES.includes(name) ? name : 'REST';
		const base = StableVisemeLibrary.shape(viseme);
		const expression = EXPRESSIONS[name] || {};
		return {
			...base,
			...expression,
			shape: viseme,
			viseme,
			phoneme: name,
			cueIndex: 0,
			cueCount: 1,
			phase: 0.5,
			isPause: name === 'REST',
			release: 0,
			energy: name === 'whisper' ? 0.25 : name === 'shout' ? 1 : 0.82,
			envelope: 1,
			asymmetry: name === 'frown' ? -0.08 : 0.018,
			upperLift: Number(base.upperLift || 0),
			lowerDrop: Number(base.lowerDrop || 0)
		};
	}
}
