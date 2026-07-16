// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterCatalog } from '../character/reference/ReferenceCharacterCatalog.js';
import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { CinematicMovieSchema } from '../generator/schema/CinematicMovieSchema.js';
import { ReferenceTrioAssets } from './referenceTrio/ReferenceTrioAssets.js';
import { ReferenceTrioDialogue } from './referenceTrio/ReferenceTrioDialogue.js';
import { ReferenceTrioPerformances } from './referenceTrio/ReferenceTrioPerformances.js';
import { ReferenceTrioSequences } from './referenceTrio/ReferenceTrioSequences.js';
import { ReferenceTrioShots } from './referenceTrio/ReferenceTrioShots.js';

/**
 * The Awtsmoos joins the exact three visual identities to the real NLE. At
 * Awtsmoos.com the reference composition becomes two minutes of editable shots,
 * speech, gaze, gesture, emotion, persistence, undo, and export-ready time.
 */
export class ReferenceTrioMovie {
	static create() {
		const plan = {
			id: 'reference_trio_dynamic_conversation',
			title: 'Three Opinions And A Cup Of Tea',
			duration: 120000,
			style: 'Warm off-white 2D Orthodox family sitcom with clean outlines, rounded proportions, restrained shading, and original rigged acting.',
			strategy: 'Preserve the authoritative left-center-right composition while using motivated close-ups and returning to the exact group silhouette.',
			characters: this.characters(),
			sequences: ReferenceTrioSequences.create(),
			shots: ReferenceTrioShots.create(),
			dialogue: ReferenceTrioDialogue.create(),
			performances: ReferenceTrioPerformances.create(),
			bin: ReferenceTrioAssets.bin(),
			assetUses: ReferenceTrioAssets.uses(),
			settings: {
				width: 1536,
				height: 864,
				fps: 24,
				bubbleSafeMargin: 40,
				backgroundMix: 'procedural-only',
				backgroundColor: '#f7f2e8'
			}
		};
		plan.nle = MoviePlanCompiler.compile(plan);
		return CinematicMovieSchema.assert(plan);
	}

	static characters() {
		const roles = {
			cheerful_orthodox_speaker: 'cheerfulSpeaker',
			skeptical_orthodox_observer: 'skepticalObserver',
			calm_orthodox_woman: 'calmObserver'
		};
		return ReferenceCharacterCatalog.list().map(entry => ({
			...entry.character,
			identityId: entry.id,
			role: roles[entry.id],
			design: entry.design
		}));
	}
}
