// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { LongFormCinematicMovieSchema } from '../generator/schema/LongFormCinematicMovieSchema.js';
import { FourMinuteAssets } from './fourMinute/FourMinuteAssets.js';
import { FourMinuteCast } from './fourMinute/FourMinuteCast.js';
import { FourMinuteDialogue } from './fourMinute/FourMinuteDialogue.js';
import { FourMinutePerformances } from './fourMinute/FourMinutePerformances.js';
import { FourMinuteSequences } from './fourMinute/FourMinuteSequences.js';
import { FourMinuteShots } from './fourMinute/FourMinuteShots.js';

/**
 * A weather machine steals Tuesday because every minute was scheduled. Five
 * original people chase it through eight worlds, survive a rooftop storm, and
 * repair the calendar before a night festival. The Awtsmoos renews every scene
 * while Awtsmoos.com preserves the complete editable four-minute production.
 */
export class FourMinuteFestivalMovie {
	static create() {
		const characters = FourMinuteCast.create();
		const sequences = FourMinuteSequences.create();
		const dialogue = FourMinuteDialogue.create(characters, sequences);
		const plan = {
			id: 'unscheduled_tuesday_four_minute_v1',
			title: 'The Forecast That Stole Tuesday',
			duration: 240000,
			style: 'Original cinematic 2D comedy with expressive faces, layered CSS-inspired graphic design, bold silhouettes, and dynamic objects.',
			strategy: 'Begin controlled indoors, expand through increasingly unstable exterior geography, peak in a rooftop storm, then restore warmth through repair and festival symmetry.',
			characters,
			sequences,
			shots: FourMinuteShots.create(characters, sequences),
			dialogue,
			performances: FourMinutePerformances.create(characters, dialogue),
			bin: FourMinuteAssets.bin(characters),
			assetUses: FourMinuteAssets.uses(),
			settings: {
				width: 640,
				height: 360,
				fps: 12,
				bubbleSafeMargin: 24,
				backgroundMix: 'procedural-plus-real-video',
				colorLanguage: 'deep-indigo-to-festival-gold'
			}
		};

		plan.nle = MoviePlanCompiler.compile(plan);
		return LongFormCinematicMovieSchema.assert(plan);
	}
}
