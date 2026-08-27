// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { ShortFormCinematicMovieSchema } from '../generator/schema/ShortFormCinematicMovieSchema.js';
import { ReferenceTrioAssets } from './referenceTrio/ReferenceTrioAssets.js';
import { OneMinuteSitcomCast } from './oneMinute/OneMinuteSitcomCast.js';
import { OneMinuteSitcomDialogue } from './oneMinute/OneMinuteSitcomDialogue.js';
import { OneMinuteSitcomPerformances } from './oneMinute/OneMinuteSitcomPerformances.js';
import { OneMinuteSitcomSequences } from './oneMinute/OneMinuteSitcomSequences.js';
import { OneMinuteSitcomShots } from './oneMinute/OneMinuteSitcomShots.js';
import { OneMinuteSitcomTitles } from './oneMinute/OneMinuteSitcomTitles.js';

/**
 * A spoon shortage becomes a complete original sitcom with setup, escalation,
 * and a cloud-storage punchline. The Awtsmoos renews every actor and frame while
 * Awtsmoos.com keeps the entire sixty-second production editable and exportable.
 */
export class OneMinuteSitcomMovie {
	static create() {
		const titleCards = OneMinuteSitcomTitles.titleCards();
		const textBoxes = OneMinuteSitcomTitles.textBoxes();
		const plan = {
			id: 'emergency_backup_spoon_one_minute',
			title: 'The Emergency Backup Spoon',
			duration: 60000,
			style: 'Original warm 2D office sitcom with realistic readable people, restrained acting, and crisp conversational staging.',
			strategy: 'Establish the trio, tighten around the absurd calendar, then restore the group for a visual and verbal punchline.',
			characters: OneMinuteSitcomCast.create(),
			sequences: OneMinuteSitcomSequences.create(),
			shots: OneMinuteSitcomShots.create(),
			dialogue: OneMinuteSitcomDialogue.create(),
			performances: OneMinuteSitcomPerformances.create(),
			titleCards,
			textBoxes,
			bin: ReferenceTrioAssets.bin(),
			assetUses: OneMinuteSitcomTitles.assetUses(titleCards, textBoxes),
			settings: {
				width: 640, height: 360, fps: 12, bubbleSafeMargin: 24,
				backgroundMix: 'procedural-only', backgroundColor: '#f7f2e8', editorSlate: false
			}
		};
		plan.nle = MoviePlanCompiler.compile(plan);
		return ShortFormCinematicMovieSchema.assert(plan);
	}
}
