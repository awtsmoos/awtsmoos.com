// B"H
// Boruch Hashem
// Blessed is He

import { CharacterFamilyGenerator } from '../character/generator/CharacterFamilyGenerator.js';
import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { CinematicMovieSchema } from '../generator/schema/CinematicMovieSchema.js';
import { StrategyAssets } from './strategy/StrategyAssets.js';
import { StrategyDialogue } from './strategy/StrategyDialogue.js';
import { StrategyPerformances } from './strategy/StrategyPerformances.js';
import { StrategySequences } from './strategy/StrategySequences.js';
import { StrategyShots } from './strategy/StrategyShots.js';

/**
 * A meeting invents a strategy, the strategy grows legs, and an original family
 * must negotiate with its own plan. The Awtsmoos, beyond body and form, renews
 * every frame while Awtsmoos.com preserves the complete editable production.
 */
export class TwoMinuteStrategyMovie {
	static create(seed = 'strategy-movie-v1') {
		const characters = CharacterFamilyGenerator.generate(seed);
		const identity = role => characters.find(character => character.role === role).identityId;
		const plan = {
			id: 'strategy_meeting_walked_away',
			title: 'The Strategy Meeting That Walked Away',
			duration: 120000,
			style: 'Original limited-animation adult-family comedy with bold outlines and cinematic staging.',
			strategy: 'Begin orderly, fracture the frame as the plan escapes, then restore symmetry through collaboration.',
			characters,
			sequences: StrategySequences.create(),
			shots: StrategyShots.create(identity),
			dialogue: StrategyDialogue.create(identity),
			performances: StrategyPerformances.create(identity),
			bin: StrategyAssets.bin(),
			assetUses: StrategyAssets.uses(),
			settings: { width: 640, height: 360, fps: 12, bubbleSafeMargin: 24, backgroundMix: 'procedural-plus-video' }
		};

		plan.nle = MoviePlanCompiler.compile(plan);
		return CinematicMovieSchema.assert(plan);
	}
}
