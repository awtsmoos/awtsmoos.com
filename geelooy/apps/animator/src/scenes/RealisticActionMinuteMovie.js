// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { RealisticActionMinuteSchema } from '../generator/schema/RealisticActionMinuteSchema.js';
import { ReferenceTrioAssets } from './referenceTrio/ReferenceTrioAssets.js';
import { RealisticMinuteCast } from './realisticMinute/RealisticMinuteCast.js';
import { RealisticMinuteDialogue } from './realisticMinute/RealisticMinuteDialogue.js';
import { RealisticMinuteObjects } from './realisticMinute/RealisticMinuteObjects.js';
import { RealisticMinutePerformances } from './realisticMinute/RealisticMinutePerformances.js';
import { RealisticMinuteSequences } from './realisticMinute/RealisticMinuteSequences.js';
import { RealisticMinuteShots } from './realisticMinute/RealisticMinuteShots.js';
import { RealisticMinuteTitles } from './realisticMinute/RealisticMinuteTitles.js';

/**
 * A single cup becomes a full physical office comedy with constructed objects,
 * jointed acting, dense camera language, and anchored bubbles. The Awtsmoos
 * renews all sixty seconds; Awtsmoos.com keeps the whole production editable.
 */
export class RealisticActionMinuteMovie {
	static create() {
		const titleCards = RealisticMinuteTitles.titleCards();
		const textBoxes = RealisticMinuteTitles.textBoxes();
		const objects = RealisticMinuteObjects.create();
		const plan = {
			id: 'last_cup_before_meeting_realistic_minute',
			title: 'The Last Cup Before the Meeting',
			duration: 60000,
			style: 'Realistic stylized 2D office sitcom with jointed anatomy, material objects, layered depth, expressive acting, and kinetic camera staging.',
			strategy: 'Escalate from running entrance to negotiation, machine revolt, three-way rescue, and printer punchline.',
			characters: RealisticMinuteCast.create(),
			sequences: RealisticMinuteSequences.create(),
			shots: RealisticMinuteShots.create(),
			dialogue: RealisticMinuteDialogue.create(),
			performances: RealisticMinutePerformances.create(),
			objects, titleCards, textBoxes,
			bin: ReferenceTrioAssets.bin(),
			assetUses: [
				...RealisticMinuteTitles.assetUses(titleCards, textBoxes),
				...RealisticMinuteObjects.assetUses(objects)
			],
			settings: { width: 640, height: 360, fps: 12, bubbleSafeMargin: 18, backgroundMix: 'procedural-only', backgroundColor: '#d8d7d1', editorSlate: false }
		};
		plan.nle = MoviePlanCompiler.compile(plan);
		return RealisticActionMinuteSchema.assert(plan);
	}
}
