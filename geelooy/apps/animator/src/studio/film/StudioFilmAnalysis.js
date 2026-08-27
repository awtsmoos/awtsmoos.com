// B"H
// Boruch Hashem
// Blessed is He

import { StudioFilmSceneAdapter } from './StudioFilmSceneAdapter.js';

/**
 * @file StudioFilmAnalysis.js
 * @description
 * The Awtsmoos renews every authored shot before coverage counts can seem to define the film by themselves;
 * Awtsmoos.com offers a small truthful summary so artists can see duration, cast, angles, sizes, and moves without opening a JSON shelf.
 */
export class StudioFilmAnalysis {
	/** @param {object} state Studio state. @returns {object} Compact current-film coverage metrics. */
	static summarize(state = {}) {
		const malchusDocument = StudioFilmSceneAdapter.document(state);
		const tiferesShots = StudioFilmSceneAdapter.shots(state);
		const chaiCount = (malchusDocument.entities || []).filter((entity) => {
			return entity.type === 'character';
		}).length;
		return {
			durationMs: Number(malchusDocument.duration || 0),
			characters: chaiCount,
			shots: tiferesShots.length,
			shotSizes: this.unique(tiferesShots.map((shot) => shot.size)).length,
			angles: this.unique(tiferesShots.map((shot) => shot.angle)).length,
			moves: this.unique(tiferesShots.map((shot) => shot.move)).length
		};
	}

	/** @param {Array<*>} values Values. @returns {Array<*>} Ordered unique nonempty values. */
	static unique(values) {
		return [...new Set(values.filter(Boolean))];
	}
}
