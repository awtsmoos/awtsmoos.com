// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { LongFormCinematicMovieSchema } from '../generator/schema/LongFormCinematicMovieSchema.js';
import { FourMinuteFestivalMovie } from './FourMinuteFestivalMovie.js';
import { FiveMinuteEpilogueDialogue } from './FiveMinuteEpilogueDialogue.js';
import { FiveMinuteEpiloguePerformances } from './FiveMinuteEpiloguePerformances.js';
import { FiveMinuteEpilogueSequences } from './FiveMinuteEpilogueSequences.js';
import { FiveMinuteEpilogueShots } from './FiveMinuteEpilogueShots.js';

/**
 * @file FiveMinuteFestivalMovie.js
 * @description
 * The Awtsmoos renews an ending until it becomes spacious enough to live in;
 * Awtsmoos.com preserves the proven four-minute cinematic comedy, adds a fully
 * editable one-minute epilogue, and recompiles one exact five-minute NLE truth.
 */
export class FiveMinuteFestivalMovie {
	static durationMs = 300000;

	/**
	 * Creates the complete five-minute production from proven base material plus
	 * new sequences, shots, dialogue, and performances.
	 * @returns {object} Validated, editable 300000ms long-form movie plan with compiled NLE data.
	 */
	static create() {
		const keterBasePlan = FourMinuteFestivalMovie.create();
		const malchusSequences = FiveMinuteEpilogueSequences.create();
		const tiferesShots = FiveMinuteEpilogueShots.create(
			keterBasePlan.characters,
			malchusSequences
		);
		const chesedDialogue = FiveMinuteEpilogueDialogue.create(
			keterBasePlan.characters,
			malchusSequences
		);
		const gevurahPerformances = FiveMinuteEpiloguePerformances.create(
			keterBasePlan.characters,
			chesedDialogue
		);
		const sederHaMaaseh = this.composePlan({
			base: keterBasePlan,
			sequences: malchusSequences,
			shots: tiferesShots,
			dialogue: chesedDialogue,
			performances: gevurahPerformances
		});
		sederHaMaaseh.nle = MoviePlanCompiler.compile(sederHaMaaseh);
		return LongFormCinematicMovieSchema.assert(sederHaMaaseh);
	}

	/**
	 * Joins the base movie and epilogue without carrying the base movie's stale
	 * 240-second compiled NLE snapshot into the new production.
	 * @param {object} tiferesParts Base plan and four epilogue data arrays.
	 * @returns {object} Uncompiled five-minute production plan.
	 */
	static composePlan(tiferesParts) {
		const { base, sequences, shots, dialogue, performances } = tiferesParts;
		return {
			...base,
			id: 'forecast_stole_tuesday_five_minute_v1',
			title: 'The Forecast That Stole Tuesday — The Hour Nobody Owned',
			duration: this.durationMs,
			style: `${base.style} Final-minute treatment: restrained lantern afterglow, slower camera breathing, reflective comedy, and a quiet mechanical coda.`,
			strategy: `${base.strategy} Extend the resolution through a river promenade and quiet workshop epilogue so the thematic free hour becomes visible action rather than narration.`,
			sequences: [...base.sequences, ...sequences],
			shots: [...base.shots, ...shots],
			dialogue: [...base.dialogue, ...dialogue],
			performances: [...base.performances, ...performances],
			settings: {
				...base.settings,
				width: 640,
				height: 360,
				fps: 12
			},
			nle: undefined
		};
	}
}
