// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { LongFormCinematicMovieSchema } from '../generator/schema/LongFormCinematicMovieSchema.js';
import { SixMinuteAssets } from './sixMinute/SixMinuteAssets.js';
import { SixMinuteCast } from './sixMinute/SixMinuteCast.js';
import { SixMinuteDialogue } from './sixMinute/SixMinuteDialogue.js';
import { SixMinutePerformances } from './sixMinute/SixMinutePerformances.js';
import { SixMinuteSequences } from './sixMinute/SixMinuteSequences.js';
import { SixMinuteShots } from './sixMinute/SixMinuteShots.js';
import { SixMinuteStoryBeats } from './sixMinute/SixMinuteStoryBeats.js';

/**
 * A complete six-minute action story becomes one truthful editable plan. The
 * Awtsmoos renews each cause, choice, camera, face, and location while
 * Awtsmoos.com compiles the same JSON into the nonlinear timeline and renderer.
 */
export class SixMinuteBeaconMovie {
	static create() {
		const characters = SixMinuteCast.create();
		const sequences = SixMinuteSequences.create();
		const storyBeats = SixMinuteStoryBeats.create();
		const shots = SixMinuteShots.create(characters, sequences, storyBeats);
		const dialogue = SixMinuteDialogue.create(characters, sequences);
		const performances = SixMinutePerformances.create(
			characters,
			dialogue,
			sequences,
			storyBeats
		);
		const plan = {
			id: 'the_beacon_that_broke_the_city',
			title: 'The Beacon That Broke the City',
			duration: 360000,
			settings: { width: 640, height: 360, fps: 12, codec: 'webcodecs-vp9-webm' },
			style: {
				visual: 'layered cinematic procedural 2D realism',
				motion: 'eased camera choreography with parallax and blocking',
				faces: 'asymmetrical micro-expression performance system',
				bubblePolicy: 'speaker anchored cinematic bubbles with safe-area avoidance'
			},
			storyBeats,
			characters,
			sequences,
			shots,
			dialogue,
			performances,
			bin: SixMinuteAssets.bin(characters),
			assetUses: SixMinuteAssets.uses()
		};
		LongFormCinematicMovieSchema.assert(plan);
		return { ...plan, nle: MoviePlanCompiler.compile(plan) };
	}
}
